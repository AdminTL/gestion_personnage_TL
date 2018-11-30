import {Activity, Event, Thanks} from "@app/_models/activity";

export interface Home {
  title: String;
  summary: String,
  index_next_event: Number;
  show_next_event: Boolean;
  events: Event[];
  activity: Activity;
  thanks: Thanks;
  date: HomeDate;
  pricing: HomePricing;
}

export interface HomeDate {
  showed: Boolean;
  title: String;
  use_event_date: Boolean;
}

export interface HomePricing {
  showed: Boolean;
  title: String;
  use_next_event_pricing: Boolean;
}
