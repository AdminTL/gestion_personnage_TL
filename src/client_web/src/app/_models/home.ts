import {Activity, Event, Thanks} from "@app/_models/activity";

export interface Home {
  title: String;
  summary: String,
  indexNextEvent: Number;
  showNextEvent: Boolean;
  events: Event[];
  activity: Activity;
  thanks: Thanks;
  date: HomeDate;
  pricing: HomePricing;
}

export interface HomeDate {
  showed: Boolean;
  title: String;
  useEventDate: Boolean;
}

export interface HomePricing {
  showed: Boolean;
  title: String;
  useNextEventPricing: Boolean;
}
