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
}

export interface HomeDate {
  showed: Boolean;
  title: String;
  dates: ActivityDate[];
}

export interface ActivityDate {
  showed: Boolean;
  highlight: Boolean;
  date: String;
  text_more_information: String;
}
