import {Activity, Event, Thanks} from "@app/_models/activity";

export interface Home {
  title: string;
  summary: string,
  indexNextEvent: number;
  showNextEvent: boolean;
  events: Event[];
  activity: Activity;
  thanks: Thanks;
  date: HomeDate;
  pricing: HomePricing;
}

export interface HomeDate {
  showed: boolean;
  title: string;
  useEventDate: boolean;
}

export interface HomePricing {
  showed: boolean;
  title: string;
  useNextEventPricing: boolean;
}
