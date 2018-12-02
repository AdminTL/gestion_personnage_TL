export interface Event {
  title: string;
  eventType: string;
  date: EventDate;
  selected: boolean;
  pricing: Price[];
  facebook_event: FacebookEvent;
  description: Description;
  age: Age;
}

export interface Location {
  showed: boolean;
  name: string;
  external_href: string;
  address: string;
  textMoreInformation: string;
}

export interface Price {
  showed: boolean;
  title: string;
  price: number;
  currency: string;
  textMoreInformation: string;
  count_unit: number;
  matIcon: string;
}

export interface FacebookEvent {
  showed: boolean;
  external_href: string;
}

export interface Description {
  showed: boolean;
  selected: boolean;
  title: string;
  text: string;
}

export interface Activity {
  showed: boolean;
  description: Description;
  location: Location;
}

export interface Thanks {
  showed: boolean;
  description: Description;
}

export interface EventDate {
  showed: boolean;
  highlight: boolean;
  text: string;
  textMoreInformation: string;
}

export interface Age {
  showed: boolean;
  text: string;
}
