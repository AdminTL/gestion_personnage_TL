export interface Event {
  title: String;
  event_type: String;
  date: String;
  selected: Boolean;
  price: Price;
  season_pass: SeasonPass;
  facebook_event: FacebookEvent;
  description: Description;
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
  single: Number;
  currency: String;
}

export interface SeasonPass {
  showed: Boolean;
  text: String;
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
  stat: ActivityStatistic;
  location: Location;
}

export interface Thanks {
  showed: Boolean;
  description: Description;
}

export interface ActivityStatistic {
  total_season_pass: Number;
}
