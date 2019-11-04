import * as querystring from 'querystring';
import * as React from 'react';
import { ChangeEvent, CSSProperties, HTMLProps, PureComponent, ReactNode } from 'react';
import * as Autocomplete from 'react-autocomplete';

import { InputProps } from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

import { AutosuggestResponse, Suggestion } from './types';

interface PlaceAutocompleteProps {
  className?: string;
  placeholder?: string;
  onSelect: (value: string, item: Suggestion) => void;
}

interface PlaceAutocompleteState {
  isOpen: boolean;
  suggestions: Suggestion[],
  value: string
}

class PlaceAutocomplete extends PureComponent<PlaceAutocompleteProps, PlaceAutocompleteState> {

    constructor(props: PlaceAutocompleteProps) {
        super(props);
        this.state = {
            isOpen: false,
            suggestions: [],
            value: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.renderInput = this.renderInput.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
        this.handleMenuVisibilityChange = this.handleMenuVisibilityChange.bind(this);
    }

    handleChange(e: ChangeEvent<HTMLInputElement>, value: string) {
        this.setState({ value });
        this.fetchSuggestions(value)
            .then(suggestions => this.setState({ suggestions }));
    }

    handleSelect(value: string, item: Suggestion) {
        this.setState({ value });
        this.props.onSelect(value, item);
    }

    fetchSuggestions(searchText: string): Promise<Suggestion[]> {
        // const url = 'https://autocomplete.geocoder.api.here.com/6.2/suggest.json';
        const url = 'https://places.cit.api.here.com/places/v1/autosuggest';
        const query = querystring.stringify({
            q: searchText,
            result_types: 'address',
            in: '-180,-90,180,90',
            // size: 10,
            // query: searchText,
            // language: i18n.language,
            // maxresults: 10,
            app_id: process.env.HERE_APP_ID,
            app_code: process.env.HERE_APP_CODE
        });
        const headers = new Headers();
        // this should use current user language
        headers.append('Accept-Language', 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7');
        return fetch(`${url}?${query}`, { headers })
            .then((response: Response) => response.json())
            .then((response: AutosuggestResponse) => {
                if (response.results) {
                    return response.results;
                }
                return [];
            })
    }

    renderInput(props: HTMLProps<HTMLInputElement>): ReactNode {
        const { ref, ...inputProps } = props;
        return <TextField
            margin="normal"
            fullWidth
            autoFocus
            InputProps={inputProps as Partial<InputProps>}
            inputRef={ref as React.Ref<any>}
        />
    }

    renderMenu(items: ReactNode[], value: string, styles: CSSProperties): ReactNode {
        return (
            <div style={{ ...styles, position: "absolute", zIndex: 1500 }}>
                <Paper square>
                    {items}
                </Paper>
            </div>
        )
    }


    renderItem(item: Suggestion, isHighlighted: boolean, styles?: CSSProperties): ReactNode {
        return (
            // item.locationId // item.label
            <MenuItem key={item.id} selected={isHighlighted} component="div" ContainerProps={{ style: styles }}>
                {this.getItemValue(item)}, {item.vicinity.replace(/<br\s?\/?>/, ', ')}
            </MenuItem>
        )
    }

    getItemValue(item: Suggestion): string {
        return item.title;
    }

    handleMenuVisibilityChange(isOpen: boolean) {
        this.setState({ isOpen });
    }

    render() {
        const { onSelect, ...inputProps } = this.props;
        const { suggestions, value } = this.state;
        return (
            <Autocomplete
                inputProps={inputProps}
                getItemValue={this.getItemValue}
                items={suggestions}
                renderInput={this.renderInput}
                renderItem={this.renderItem}
                renderMenu={this.renderMenu}
                menuStyle={{
                    position: 'absolute',
                    zIndex: 1,
                } as CSSProperties}
                wrapperStyle={{} as CSSProperties}
                value={value}
                onChange={this.handleChange}
                onSelect={this.handleSelect}
                onMenuVisibilityChange={this.handleMenuVisibilityChange}
            />
        )
    }
}

export default PlaceAutocomplete;
