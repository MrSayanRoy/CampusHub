import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Tag,
  Share2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export default function EventsPage() {
  const { events, registeredEvents, toggleEventRsvp } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const categories = ['All', 'Competition', 'Career', 'Workshop', 'Social'];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRsvp = (event) => {
    const isNowRegistered = toggleEventRsvp(event.id);
    addToast({
      title: isNowRegistered ? 'RSVP Successful!' : 'RSVP Cancelled',
      message: isNowRegistered
        ? `You are attending "${event.title}". Event details synced to your college calendar.`
        : `Your spot for "${event.title}" has been canceled.`,
      type: isNowRegistered ? 'success' : 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight flex items-center gap-2.5">
            <Calendar className="h-6 w-6 text-[#DC2626]" />
            College Event Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Browse upcoming university hackathons, guest lectures, career fairs, and campus workshops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg">
            {registeredEvents.length} RSVP'd Events
          </Badge>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Input
            icon={Search}
            placeholder="Search events, locations, topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'bg-neutral-100 text-[#737373] hover:bg-neutral-200 hover:text-[#171717]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No campus events found"
          description="Try broadening your search term or switching to a different category."
          actionLabel="Show all events"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((ev) => {
            const isRegistered = registeredEvents.includes(ev.id);

            return (
              <Card key={ev.id} className="flex flex-col justify-between overflow-hidden">
                {/* Event Cover Image */}
                <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge variant="dark" size="sm">
                      {ev.category}
                    </Badge>
                    {ev.badge && (
                      <Badge variant="primary" size="sm">
                        {ev.badge}
                      </Badge>
                    )}
                  </div>

                  {isRegistered && (
                    <div className="absolute top-3 right-3 bg-[#16A34A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Registered
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="text-base sm:text-lg hover:text-[#DC2626] cursor-pointer transition-colors" onClick={() => setSelectedEvent(ev)}>
                      {ev.title}
                    </CardTitle>
                    <p className="text-xs text-[#DC2626] font-semibold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {ev.date} • {ev.time}
                    </p>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2 text-xs">
                    {ev.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2 text-xs pt-0">
                  <div className="flex items-center gap-2 text-[#171717] font-medium">
                    <MapPin className="h-4 w-4 text-[#737373] shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#737373] pt-2 border-t border-[#E5E5E5]">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {ev.attendeesCount} attending / {ev.capacity} spots
                    </span>
                    <span className="text-[#A3A3A3]">By {ev.organizer}</span>
                  </div>
                </CardContent>

                <CardFooter className="bg-[#FAFAFA]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEvent(ev)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant={isRegistered ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleRsvp(ev)}
                  >
                    {isRegistered ? 'Leave Event' : 'RSVP Now'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          description={`${selectedEvent.category} • Organized by ${selectedEvent.organizer}`}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
              <Button
                variant={registeredEvents.includes(selectedEvent.id) ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  handleRsvp(selectedEvent);
                  setSelectedEvent(null);
                }}
              >
                {registeredEvents.includes(selectedEvent.id) ? 'Cancel RSVP' : 'Confirm RSVP'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden h-48 bg-neutral-100">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-[#737373]">Date & Time</span>
                <p className="font-bold text-[#171717]">{selectedEvent.date}</p>
                <p className="text-[#737373]">{selectedEvent.time}</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-[#737373]">Location</span>
                <p className="font-bold text-[#171717]">{selectedEvent.location}</p>
                <p className="text-[#737373]">Capacity: {selectedEvent.capacity} students</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#171717]">About this event</h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
