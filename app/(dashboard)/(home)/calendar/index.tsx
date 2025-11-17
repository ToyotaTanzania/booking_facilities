'use client';
import { faker } from '@faker-js/faker';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/src/components/ui/shadcn-io/kanban';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/trpc/react';
import _ from 'lodash';
import EventItem from './eventItem';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const columns = [
  { id: faker.string.uuid(), name: 'Planned', color: '#6B7280' },
  { id: faker.string.uuid(), name: 'In Progress', color: '#F59E0B' },
  { id: faker.string.uuid(), name: 'Done', color: '#10B981' },
];
const users = Array.from({ length: 4 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
  }));
const exampleFeatures = Array.from({ length: 20 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: capitalize(faker.company.buzzPhrase()),
    startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
    endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
    column: faker.helpers.arrayElement(columns).id,
    owner: faker.helpers.arrayElement(users),
  }));

const KarimjeeCalendar = () => {
  const [features, setFeatures] = useState(exampleFeatures);
  const [ bookings, setBookings ] = useState<any>([]);
  const { data: facilities, isLoading: loadingFacilities } = api.facility.getAll.useQuery()
  const { data: allBookings, isLoading: loadingBookings } = api.booking.filteredBookings.useQuery({
    date: undefined
  })

  useEffect(() => {
    if (!allBookings || allBookings.length === 0) return;
    console.log(allBookings)
    const groupedBookings = _.groupBy(allBookings, "code");
    const mapped = _.map(groupedBookings, (record, code) => {
      const first = record[0];
      const last = record[record.length - 1];
      console.log(record)
      return {
        id: code,
        date: first.date,
        name: first.description || "",
        start: first.start,
        end: last.end,
        uid: code,
        column: first.facility?.id ? first.facility.id.toString() : '',
        owner: first.user,
        status: first.status,
        description: first.description || "",
        // resourceId: first.facility?.id ? first.facility.id.toString() : "",
      };
    });
    setBookings(mapped);
  }, [allBookings]);

  return (
    <KanbanProvider
      columns={facilities?.map((f) => ({
        id: f.id.toString(),
        name: f.name,
        color: f.color || '#6B7280',
      })) || []}
      data={bookings}
      onDataChange={setBookings}
    >
      {(column) => (
        <KanbanBoard 
          id={column.id} 
          key={column.id} 
          className='overflow-x-scroll'
          
        >
          <KanbanHeader>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
              />
              <span>{column.name}</span>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id} className='w-[200px]' >
            {(feature: any) => (
              <KanbanCard
                draggable={false}
                column={column.id}
                id={feature.id}
                key={feature.id}
                name={feature.name}
                
              >
                <EventItem event={feature} />
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
};
export default KarimjeeCalendar;
