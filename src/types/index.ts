export interface SearchBody {
    Response: SearchResponse
}

export interface SearchResponse {
    MetaInfo: MetaInfo
    View: SearchResponseView[]
}

export interface MetaInfo {
    RequestId?: string;
    Timestamp?: string;
    NextPageInformation?: string;
    PreviousPageInformation?: string;
    AdditionalData?: {[key: string]: string | number}
}

export interface SearchResponseView {
    ViewId: string
    Result: SearchResult[]
}

export interface SearchResult {
    Distance: number;
    Direction: number;
    Location: Location;
    MatchCode: string;
    MatchLevel: string;
    MatchType: string;
    MatchQuality: MatchQuality;
    Relevance: number;
}

export interface Location {
    Label?: string;
    Country?: string;
    State?: string;
    County?: string;
    City?: string;
    District?: string;
    Subdistrict?: string;
    Street?: string;
    HouseNumber?: string;
    PostalCode?: string;
    Building?: string;
    AddressLine?: string;
    AdditionalData?: {[key: string]: string | number}
    Unit?: string;
    MapView: MapView;
    Shape?: Shape
}

export interface MapView {
    TopLeft: Position
    BottomRight: Position
}

export interface Position {
    Latitude: number;
    Longitude: number;
}

export interface Shape {
    Value: string;
}

export interface MatchQuality {
    Name?: number;
    Country?: number;
    State?: number;
    County?: number;
    City?: number;
    District?: number;
    Subdistrict?: number;
    Street?: number;
    HouseNumber?: number;
    PostalCode?: number;
    Building?: number;
    Unit?: number;
}

export interface LandmarkGeocodeParameters {
    additionaldata?: string;
    addressattributes?: string;
    app_id: string;
    app_code: string;
    bbox?: string;
    categoryids?: number;
    city?: string;
    country?: string;
    countryfocus?: string;
    county?: string;
    district?: string;
    gen?: number;
    housenumber?: string;
    jsonattributes?: number;
    jsoncallback?: string;
    language?: string;
    locationattributes?: string;
    locationid?: string;
    mapview?: string;
    maxresults?: number;
    name?: string;
    pageinformation?: string;
    politicalview?: string;
    postalcode?: string;
    prox?: string;
    responseattributes?: string;
    searchtext?: string;
    state?: string;
    street?: string;
    strictlanguagemode?: boolean;
    token?: string;
}

export interface Suggestion {
    bbox: number[];
    category: string;
    categoryTitle: string;
    distance: number;
    highlightedTitle: string;
    highlightedVicinity: string;
    href: string;
    id: string;
    position: number[];
    resultType: string;
    title: string;
    type: string;
    vicinity: string;
}

export interface AutosuggestResponse {
    results: Suggestion[]
}

export declare class GeoPolygon extends H.geo.AbstractGeometry {
    getExterior(): H.geo.LineString;
}
