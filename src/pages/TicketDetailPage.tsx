import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, AlertTriangle, MapPin, FileText, Briefcase, Edit } from 'lucide-react';
import { useTickets } from '@/contexts/TicketContext';
import { useJobs } from '@/context/JobContext';
import { TicketTimelinePanel } from '@/components/TicketTimelinePanel';
import { AddNoteModal } from '@/components/AddNoteModal';
import { CreateJobFromTicketModal } from '@/components/CreateJobFromTicketModal';
import { getLocationPath, mockFlatLocations, getTagColors, getStatusColors } from '@/lib/ticketUtils';
import { format } from 'date-fns';

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { getTicket, addNoteToTicket, addJobToTicket } = useTickets();
  const { getJobById, getJobsByTicketReference } = useJobs();

  const [showAddNote, setShowAddNote] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);

  const ticket = getTicket(ticketId || '');

  // Get jobs linked to this ticket - both from ticket.jobs array and by ticketReference
  const linkedJobs = ticket ? [
    ...ticket.jobs.map(jobId => getJobById(jobId)).filter(Boolean),
    ...getJobsByTicketReference(ticket.reference)
  ].filter((job, index, self) => 
    job && self.findIndex(j => j?.id === job.id) === index // Remove duplicates
  ) : [];

  if (!ticket) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-4">The ticket you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/tickets')}>Back to Tickets</Button>
        </div>
      </div>
    );
  }

  const locationData = mockFlatLocations.find(loc => ticket.locations.includes(loc.id));
  const hasHazards = locationData?.hazards && locationData.hazards.length > 0;

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tickets')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {ticket.reference}
            </Badge>
            <h1 className="text-2xl font-bold">{ticket.shortDescription}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Created {format(new Date(ticket.createdDate), 'dd MMM yyyy HH:mm')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowCreateJob(true)}
        >
          <Plus className="h-4 w-4" />
          New Job
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tags and Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {ticket.tags.map(tag => (
                  <Badge key={tag} variant="outline" className={`border ${getTagColors(tag)}`}>
                    {tag}
                  </Badge>
                ))}
                <Badge className={`border ${getStatusColors(ticket.status)} hover:opacity-90`}>
                  {ticket.status}
                </Badge>
                <Badge variant="outline">{ticket.priority}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <p className="text-sm mt-1">{ticket.longDescription}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Impact</div>
                    <div className="mt-1">{ticket.impact}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Classification</div>
                    <div className="mt-1">{ticket.classification}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Ticket Queue</div>
                    <div className="mt-1">{ticket.ticketQueue}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">SLA</div>
                    <div className="mt-1">{ticket.sla.name}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium text-muted-foreground mb-2">Reported By</div>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{ticket.reportedBy.name}</div>
                    <div className="text-muted-foreground">{ticket.reportedBy.email}</div>
                    <div className="text-muted-foreground">{ticket.reportedBy.phone}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {hasHazards && locationData && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Insights</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-900 mb-1">
                        {getLocationPath(locationData.id)}
                      </div>
                      <div className="text-sm text-amber-800 mb-3">
                        There are known hazards in this location
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-amber-900">
                          {locationData.hazards?.length} item{locationData.hazards?.length !== 1 ? 's' : ''}: {locationData.hazards?.map(h => h.description).join(', ')}
                        </div>
                        <Button variant="outline" size="sm" className="bg-white">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {locationData.assets && locationData.assets.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Space status</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Space classification</div>
                          <Badge variant="secondary" className="mt-1">Storage rooms</Badge>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Space type</div>
                          <Badge variant="secondary" className="mt-1">Facility</Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Jobs Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Jobs</h3>
              </div>
            </CardHeader>
            <CardContent>
              {linkedJobs.length > 0 ? (
                <div className="space-y-2">
                  {linkedJobs.map(job => job && (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => navigate(`/job/${job.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{job.jobNumber}</span>
                          <Badge variant="outline" className="text-xs">
                            {job.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {job.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>Engineer: {job.engineer || 'Unassigned'}</span>
                          <span>•</span>
                          <span>{job.customer}</span>
                        </div>
                      </div>
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'allocated' ? 'secondary' :
                        'outline'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No jobs created yet</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => setShowCreateJob(true)}
                  >
                    Create a job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Notes</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowAddNote(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ticket.notes.length > 0 ? (
                <div className="space-y-4">
                  {ticket.notes.map(note => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{note.author}</div>
                          <Badge
                            variant={note.visibility === 'Public' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {note.visibility}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(note.timestamp), 'dd MMM yyyy HH:mm')}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      {note.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {note.attachments.map(attachment => (
                            <Badge key={attachment.id} variant="outline">
                              {attachment.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline Panel */}
        <div className="lg:col-span-1">
          <TicketTimelinePanel timeline={ticket.timeline} className="sticky top-6" />
        </div>
      </div>

      {/* Modals */}
      <AddNoteModal
        open={showAddNote}
        onOpenChange={setShowAddNote}
        ticketId={ticket.id}
        onSave={(note) => addNoteToTicket(ticket.id, note)}
      />

      <CreateJobFromTicketModal
        open={showCreateJob}
        onOpenChange={setShowCreateJob}
        ticketId={ticket.id}
        defaultLocation={ticket.locations[0] ? getLocationPath(ticket.locations[0]) : undefined}
        onCreateJob={(jobData) => {
          const jobId = `JOB${Math.floor(Math.random() * 1000)}`;
          addJobToTicket(ticket.id, jobId, jobData);
        }}
      />
    </div>
  );
}
