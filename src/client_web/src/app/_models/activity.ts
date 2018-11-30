export interface Event {
  title: String;
  event_type: String;
  date: EventDate;
  selected: Boolean;
  pricing: Price[];
  facebook_event: FacebookEvent;
  description: Description;
  age: Age;
}

export interface Location {
  showed: Boolean;
  name: String;
  external_href: String;
  address: String;
  text_more_information: String;
}

export interface Price {
  showed: Boolean;
  title: String;
  price: Number;
  currency: String;
  text_more_information: String;
  count_unit: Number;
  matIcon: String;
}

export interface FacebookEvent {
  showed: Boolean;
  external_href: String;
}

export interface Description {
  showed: Boolean;
  selected: Boolean;
  title: String;
  text: String;
}

export interface Activity {
  showed: Boolean;
  description: Description;
  location: Location;
}

export interface Thanks {
  showed: Boolean;
  description: Description;
}

export interface EventDate {
  showed: Boolean;
  highlight: Boolean;
  text: String;
  text_more_information: String;
}

export interface Age {
  showed: Boolean;
  text: String;
}
