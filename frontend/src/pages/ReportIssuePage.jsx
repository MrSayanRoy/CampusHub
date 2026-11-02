import React, { useState } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  Filter,
  ShieldAlert,
  Upload,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export default function ReportIssuePage() {
  const { issues, submitIssue, buildings, user } = useApp();
  const { addToast } = useToast();

  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    building: buildings[0]?.name || 'Engineering & Computing Hall',
    location: '',
    category: 'Classroom Tech',
    priority: 'high',
    description: '',
  });

  const categories = [
    'Classroom Tech',
    'Plumbing & Restroom',
    'Safety & Lighting',
    'HVAC / Temperature',
    'WiFi / Network',
    'Furniture & Cleanliness',
  ];

  const priorities = [
    { value: 'low', label: 'Low (Minor inconvenience)' },
    { value: 'normal', label: 'Normal (Standard maintenance)' },
    { value: 'high', label: 'High (Affects lecture/study)' },
    { value: 'urgent', label: 'Urgent (Safety hazard)' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.description) {
      addToast({
        title: 'Incomplete Form',
        message: 'Please provide a title, exact room/location, and description.',
        type: 'error',
      });
      return;
    }

    const created = submitIssue(formData);
    addToast({
      title: 'Ticket Submitted!',
      message: `Ticket #${created.ticketId} assigned to University Facilities Operations.`,
      type: 'success',
    });

    setFormData({
      title: '',
      building: buildings[0]?.name || 'Engineering & Computing Hall',
      location: '',
      category: 'Classroom Tech',
      priority: 'high',
      description: '',
    });
  };

  const filteredIssues = issues.filter((iss) => {
    if (filterStatus === 'All') return true;
    return iss.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight flex items-center gap-2.5">
          <AlertTriangle className="h-6 w-6 text-[#DC2626]" />
          Campus Issue Reporting
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1">
          Spotted a broken chair, malfunctioning projector, plumbing leak, or safety hazard? Submit a ticket for campus facilities dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Working Form */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-[#DC2626]" />
                Submit New Facility Ticket
              </CardTitle>
              <CardDescription>
                Direct ticket to campus physical plant and IT operations
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Issue Summary"
                  required
                  placeholder="e.g., Projector bulb burnt out in ENG-204"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <Select
                  label="Campus Facility / Building"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  options={buildings.map((b) => b.name)}
                />

                <Input
                  label="Exact Room or Area"
                  required
                  placeholder="e.g., Room 204, East Entrance, 2nd Floor Restroom"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={categories}
                  />

                  <Select
                    label="Severity / Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    options={priorities}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1.5">
                    Detailed Description <span className="text-[#DC2626]">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details to assist the repair technician (error messages, leaking volume, hazard level)..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-sm rounded-lg bg-white border border-[#E5E5E5] p-3 focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                  />
                </div>

                <div className="border border-dashed border-[#E5E5E5] rounded-lg p-3 text-center bg-[#FAFAFA]">
                  <Upload className="h-5 w-5 text-[#A3A3A3] mx-auto mb-1" />
                  <span className="text-xs text-[#737373] block">
                    Upload photo (Optional)
                  </span>
                  <span className="text-[10px] text-[#A3A3A3]">
                    PNG, JPG up to 10MB
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  leftIcon={Send}
                >
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Active & Recent Tickets */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Campus Reports</CardTitle>
                <CardDescription>Live status of reported facilities tickets</CardDescription>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
                {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-white text-[#171717] shadow-xs'
                        : 'text-[#737373] hover:text-[#171717]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-[#E5E5E5]">
              {filteredIssues.map((issue) => {
                const isResolved = issue.status === 'Resolved';
                const isInProgress = issue.status === 'In Progress';
                const statusBadge = isResolved
                  ? { variant: 'success', label: 'Resolved' }
                  : isInProgress
                  ? { variant: 'primary', label: 'In Progress' }
                  : { variant: 'warning', label: 'Open' };

                const priorityBadge =
                  issue.priority === 'urgent' || issue.priority === 'high'
                    ? { variant: 'error', label: 'High Priority' }
                    : { variant: 'secondary', label: 'Normal' };

                return (
                  <div key={issue.id} className="p-4 sm:p-5 space-y-3 hover:bg-[#FAFAFA] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded">
                            {issue.ticketId}
                          </span>
                          <span className="text-[11px] font-semibold text-[#737373]">
                            {issue.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#171717]">{issue.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={statusBadge.variant} size="sm">
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-[#737373] leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#737373] border-t border-[#E5E5E5] flex-wrap gap-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#DC2626]" />
                        <span>{issue.building} • {issue.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[#A3A3A3]">
                        <span>Reported by {issue.reportedBy}</span>
                        <span>•</span>
                        <span>{issue.createdAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
