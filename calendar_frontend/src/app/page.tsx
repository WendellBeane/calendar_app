"use client";

import { useEffect, useState, JSX } from "react"
import { Calendar, List, Badge, DatePicker, TimePicker, HStack, Divider, Input, VStack, InputNumber} from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';
import moment from 'moment'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const styles = {
  border: '1px solid black',
  padding: '5px',
}
const daysToNumbers:{[key:string]: number}= {
  "Monday": 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 7,
}
interface Event {
  id: number,
  name: string,
  start: moment.Moment,
  end: moment.Moment,
}

interface SubmitEventData {
  events: {
    name: string;
    start: string;
    end: string;
  }[];
}

export default function Home() {
  const [selectedDates, setSelectedDates] = useState<Date | null>(null);
  const [selectedStartTimes, setSelectedStartTimes] = useState<Date | null>(null);
  const [selectedEndTimes, setSelectedEndTimes] = useState<Date | null>(null);
  const [seriesDays, setSeriesDays] = useState<string[]>([]);
  const [seriesLength, setSeriesLength] = useState<number>(1);
  const [isSeries, setIsSeries] = useState(false)
  const [eventName, setEventName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvents, setNewEvent] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([])

  async function getCalendar(){
    const response = await fetch('http://127.0.0.1:8000');
    if (!response.ok){
      throw new Error("Failed to retrieve events");
    }
    return response.json();
  }
  

  async function submitEvents(data: SubmitEventData): Promise<Response | void> {
    try {
      const response = await fetch('http://127.0.0.1:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text)
      }
      console.log(response);
      return response;
    } catch (error: string | any) {
      toast.error(`An error occurred while submitting the event: ${error.message}`)
      console.log(error);
    }
  }
  

  const getEventsOnDate = (date: Date): Event[] => {
    const m = moment(date);
    return events.filter((event: Event) => {
      if (event.start.isSame(m, 'day')) {
        return event;
      }
    });
  }

  const renderCell = (date: Date): JSX.Element | undefined => {
    const eventsOnDate: Event[] = getEventsOnDate(date);

    if (eventsOnDate.length) {
      return <Badge className="calendar-todo-item-badge" />;
    }
  }

  const mergeDateTimes = (date: moment.Moment, time: moment.Moment) => {
    return moment().set({year: date.year(), month: date.month(), week: date.week(), day: date.day(), hour: time.hour(), minute: time.minute(), second: 0})
  }


  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsSeries(!isSeries);
  }

  const handleSelectDate = (date: Date): void => {
    setSelectedEvents(getEventsOnDate(date));
  }

  const handleSelectSeriesDays = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (seriesDays.includes(e.target.name)){
      const newDays = seriesDays.filter((day) => day != e.target.name);
      setSeriesDays(newDays);
    }
    else {
      setSeriesDays([...seriesDays, e.target.name]);
    }
  }

  const submitSingleEvent = () => {
    const eventDate = moment(selectedDates);
    const startTime = moment(selectedStartTimes);
    const endTime = moment(selectedEndTimes);
    const formattedStart = mergeDateTimes(eventDate, startTime);
    const formattedEnd = mergeDateTimes(eventDate, endTime);
    const data: SubmitEventData = {
      events: [
        {
          name: eventName,
          start: formattedStart.toISOString(),
          end: formattedEnd.toISOString(),
        },
      ],
    };
    submitEvents(data);
    setNewEvent(true);
  }

  const submitSeriesEvent = () => {
    const today = moment()
    const data :SubmitEventData = {
      events: []
    }
    if (seriesLength != null) {
      for (let i = 0; i < seriesLength; i++) {
        for(const day in seriesDays) {
          const dayNumber = daysToNumbers[seriesDays[day]];
          const diff = dayNumber - today.day()
          const eventDate = moment().add(diff, 'days').add(i, 'weeks');
          const startTime = moment(selectedStartTimes);
          const endTime = moment(selectedEndTimes);
          const formattedStart = mergeDateTimes(eventDate, startTime);
          const formattedEnd = mergeDateTimes(eventDate, endTime);
          data.events.push(
              {
                name: eventName,
                start: formattedStart.toISOString(),
                end: formattedEnd.toISOString(),
              })
        }
    }

    submitEvents(data)
    setNewEvent(true);
  }

  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    isSeries ? submitSeriesEvent() : submitSingleEvent();
    
  };

  useEffect(()=> {const fetchData = async () => {
    try {
      const response = await getCalendar();
      setEvents(response.map((item: Event) => ({
        id: item.id,
        name: item.name,
        start: moment(item.start),
        end: moment(item.end),
      })))
      setNewEvent(false)
    } catch(error){
      console.log("error")
      console.log(error)
    }
  }; fetchData(); }, [newEvents]);



  return (
    <>
      <div>
        <Calendar compact bordered onSelect={handleSelectDate} renderCell={renderCell}/>
        {selectedEvents.length ?
          <List style={{ flex:1 }} bordered>
              {selectedEvents.map(event => (
                <List.Item key={event.id}> <strong>{event.name}</strong>: {event.start.format('h:mm A') } - {event.end.format('h:mm A')}</List.Item> 
              ))}   
          </List> : null }
      </div>
      <div>
        <VStack divider={<Divider />}>
          <div>
            <input type="checkbox" checked={isSeries} onChange={handleCheck}/> Make series of events?
            <HStack justifyContent='center' divider={<Divider vertical />} style={{height:40}}>
                
                <Input placeholder="Event Name" onChange={setEventName} htmlSize={20} style={{width: 'auto'}}/>
                {isSeries ? 
                  <div style={{ paddingTop:'300px' }}>
                    <VStack divider = {<Divider /> }>
                      <ul> 
                        <li><input name="Monday" type="checkbox" onChange={handleSelectSeriesDays}/> Monday</li>
                        <li><input name="Tuesday" type="checkbox" onChange={handleSelectSeriesDays}/> Tuesday</li>
                        <li><input name="Wednesday" type="checkbox" onChange={handleSelectSeriesDays}/> Wednesday</li>
                        <li><input name="Thursday" type="checkbox" onChange={handleSelectSeriesDays}/> Thursday</li>
                        <li><input name="Friday" type="checkbox" onChange={handleSelectSeriesDays}/> Friday</li>
                        <li><input name="Saturday" type="checkbox" onChange={handleSelectSeriesDays}/> Saturday</li>
                        <li><input name="Sunday" type="checkbox" onChange={handleSelectSeriesDays}/> Sunday</li>
                      </ul>
                    Select number of weeks to repeat the series for
                    <InputNumber placeholder="# of weeks" max={52} onChange={(value) => setSeriesLength(value as number)}/>
                    </VStack> 
                    
                    </div>:
                    <DatePicker label="Event Date" onOk={(date) => setSelectedDates(date)} />
                  
                  }
                <TimePicker label="Start Time" format="hh:mm aa" onOk={(date) => setSelectedStartTimes(date)}/>
                <TimePicker label="End Time" format="hh:mm aa" onOk={(date) => setSelectedEndTimes(date)}/>
                <button style={styles} onClick={handleSubmit}> Submit New Event </button> 
                
            </HStack>
          </div>
        </VStack>
      </div>
      <ToastContainer position="top-right" autoClose={5000}/>
    </>
  );
}
