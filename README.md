## Running the app
* in a terminal cd into the `calendar_backend` folder run `python manage.py runserver` to run the django server
* in another terminal cd into the `calendar_frontend` folder run `npm run dev` to start the next.js app displaying the calendar

Open [http://localhost:3000](http://localhost:3000) with your browser to see the calendar interface.

# Using the calendar:
The user has the option to add single events or a series of events. When adding a single event you can select any date and time and date. The rsuite date and tiem pickers are a little specific, and you need to press the ok button in order to lock the date into state. When creating a series of events there is a check box that asks if the user wants to create a series. When that is checked a list of check boxes with the days of the week are displayed, along with an input asking for the number of weeks this event series will go on for. That input is maxed out at 52 weeks. If a user tries to create an event or event series without filling out all the fields, an error toast will appear displaying the error message from the backend indicating which field was not complete. If a user tries to create an event or event series with dates and times overlapping with existing events, another error toast will appear indicating those events were not created. 

On the calendar itself, if an event exists on a specific date, there is a red circle indicating to the user that something is scheduled that day. If the user clicks on the date a list of the events on that day will render underneath the calendar. 

# Assumptions, Decisions, acknowledgments:
* The functionality of the event series and event creation differs slightly in that a user can create an event that happened in the past, however the series always begins in the current week. 
* I did not implement anyway to delete events from the UI as that was not a requirement, but if when testing there are too many events to keep track of `python manage.py flush` will erase events in the database
* Based on the Requirements I did not assume that editing these events dates and times was a priority so the database schema and api are quite simple. They just create an event or list of events with a name, start, end, and id
* there is a rendering issue with the calendar component. Where if you submit a series of events greater than ~5 it won't always render the badge indicating there are events associated with that date. However, when you refresh the screen the badges and list of events do render. I think it is something to do with the component library I am using, but I did not have time to dig into what was going on there. 
