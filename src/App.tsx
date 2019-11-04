import { LatLng, LatLngBounds, LatLngExpression } from 'leaflet';
import * as querystring from 'querystring';
import * as React from 'react';
import { PureComponent } from 'react';
import { Map, Polygon, TileLayer } from 'react-leaflet';

import styled from '@emotion/styled'

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';

import PlaceAutocomplete from './PlaceAutocomplete';
import {
    GeoPolygon,
    LandmarkGeocodeParameters,
    SearchBody,
    SearchResponse,
    SearchResponseView,
    SearchResult,
    Suggestion
} from './types';

type NestedLatLngList = LatLngExpression[] & LatLngExpression[][] & LatLngExpression[][][]

type Geometry = H.geo.MultiGeometry<GeoPolygon> | GeoPolygon

interface AppState {
    bounds?: LatLngBounds;
    center?: LatLngExpression;
    geometry?: Geometry;
    language: string;
    positions?: NestedLatLngList | null;
    suggestion?: Suggestion;
    zoom?: number;
}

const MapContainer = styled.div`
    width: 920px;
    height: 480px;
`

export default class App extends PureComponent<{}, AppState> {

    static getDerivedStateFromProps(props: {}, state: AppState): AppState {
        if (state.geometry) {
            return {
                center: new LatLng(
                    state.geometry.getBounds().getCenter().lat,
                    state.geometry.getBounds().getCenter().lng
                ),
                bounds: new LatLngBounds(
                    new LatLng(
                        state.geometry.getBounds().getTopLeft().lat,
                        state.geometry.getBounds().getTopLeft().lng
                    ),
                    new LatLng(
                        state.geometry.getBounds().getBottomRight().lat,
                        state.geometry.getBounds().getBottomRight().lng
                    )
                ),
                positions: App.geometryToPosition(state.geometry),
            } as AppState;
        }
        return {
            center: new LatLng(38.8205, -77.0334),
            positions: null
        } as AppState;
    }

    static geometryToPosition(geometry: H.geo.MultiGeometry<GeoPolygon> | GeoPolygon): NestedLatLngList {
        const positions: NestedLatLngList = [];
        if (geometry instanceof H.geo.MultiGeometry) {
            geometry.getGeometries().forEach(g => {
                positions.push(App.geometryToPosition(g));
            })
        } else if (geometry instanceof H.geo.AbstractGeometry) {
            geometry.getExterior().eachLatLngAlt((lat, lng) =>
                positions.push(new LatLng(lat, lng))
            )
        }
        return positions;
    }

    constructor(props: {}) {
        super(props);
        this.state = {
            // geometry: H.util.wkt.toGeometry("MULTIPOLYGON (((...)))")
            // this should use current user language
            language: "fr",
            zoom: 3
        } as AppState;
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(label: string, suggestion: Suggestion) {
        this.setState({ suggestion });
        console.log(label, suggestion);
        const params: LandmarkGeocodeParameters = {
            language: this.state.language,
            // locationid: suggestion.locationId,
            name: suggestion.title,
            // prox: suggestion.position.concat(1000).join(','),
            additionaldata: "IncludeShapeLevel,default",
            app_id: process.env.HERE_APP_ID as string,
            app_code: process.env.HERE_APP_CODE as string,
            gen: 9
        } as LandmarkGeocodeParameters;
        if (suggestion.bbox) {
            params.mapview = [
                [suggestion.bbox[1], suggestion.bbox[0]].join(','),
                [suggestion.bbox[3], suggestion.bbox[2]].join(',')
            ].join(';');
        }
        // fetch(`https://geocoder.api.here.com/6.2/geocode.json?${querystring.stringify(params)}`)
        fetch(`https://geocoder.cit.api.here.com/6.2/search.json?${querystring.stringify(params as {})}`)
            .then((response: Response) => response.json())
            .then((body: SearchBody) => {
                if (body.Response && body.Response.View.length > 0) {
                    return body.Response.View[0];
                }
                if (suggestion.bbox) {
                    return {
                        Result: [{
                            Location: {
                                MapView: {
                                    TopLeft: {
                                        Latitude: suggestion.bbox[1],
                                        Longitude: suggestion.bbox[0]
                                    },
                                    BottomRight: {
                                        Latitude: suggestion.bbox[3],
                                        Longitude: suggestion.bbox[2]
                                    }
                                }
                            }
                        }]
                    } as SearchResponseView;
                }
                console.error('No response view.');
                return;
            })
            .then((view: SearchResponseView | undefined) => {
                if (view && view.Result && view.Result.length > 0) {
                    return view.Result[0];
                }
                console.error('No result.');
                return;
            })
            .then((result: SearchResult | undefined) => {
                if (result && result.Location && result.Location.Shape) {
                    return result.Location.Shape.Value;
                }
                else if (result && result.Location && result.Location.MapView) {
                    return `POLYGON ((${[
                        `${result.Location.MapView.TopLeft.Longitude} ${result.Location.MapView.TopLeft.Latitude}`,
                        `${result.Location.MapView.TopLeft.Longitude} ${result.Location.MapView.BottomRight.Latitude}`,
                        `${result.Location.MapView.BottomRight.Longitude} ${result.Location.MapView.BottomRight.Latitude}`,
                        `${result.Location.MapView.BottomRight.Longitude} ${result.Location.MapView.TopLeft.Latitude}`,
                        `${result.Location.MapView.TopLeft.Longitude} ${result.Location.MapView.TopLeft.Latitude}`
                    ].join(', ')}))`;
                }
                else if (!result || !result.Location) {
                    console.error('No location.');
                }
                return;
            })
            .then((shape: string | undefined) => {
                if (shape) {
                    // @ts-ignore
                    const geometry: Geometry = H.util.wkt.toGeometry(shape);
                    this.setState({ geometry })
                    return geometry;
                }
                return;
            });
    }

    render() {
        const { bounds, center, positions, zoom } = this.state;
        return (
            <>
                <CssBaseline />
                <main>
                    <Container maxWidth="sm">
                        <Box mb={2}>
                            <PlaceAutocomplete
                                placeholder="Search a location here..."
                                onSelect={this.handleSelect}
                            />
                        </Box>
                    </Container>
                    <Container>
                        <Grid container justify="center" spacing={2}>
                            <Grid item>
                                <MapContainer>
                                    <Map center={center} bounds={bounds} zoom={zoom} style={{ width: '100%', height: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                        />
                                        {positions && <Polygon positions={positions} />}
                                    </Map>
                                </MapContainer>
                            </Grid>
                        </Grid>
                    </Container>
                </main>
            </>
        );
    }
}
