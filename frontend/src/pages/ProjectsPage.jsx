import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

export default function ProjectsPage() {
  const { projects, joinedProjects, joinProject, createProject, user } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'open', 'mine'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New project form state
  const [formData, setFormData] = useState({
    title: '',
    department: 'Computer Science & Engineering',
    category: 'Mobile & Web',
    description: '',
    lookingFor: '',
    spotsTotal: 4,
  });

  const categories = ['All', 'Hardware & IoT', 'Mobile & Web', 'AI & Health', 'Robotics', 'Interdisciplinary'];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lookingFor.some((role) => role.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'open'
        ? p.spotsFilled < p.spotsTotal
        : joinedProjects.includes(p.id);

    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleJoin = (projectId, title) => {
    const joined = joinProject(projectId);
    if (joined) {
      addToast({
        title: 'Application Sent',
        message: `You've joined the team for "${title}". Check your notifications for team discord/slack invites.`,
        type: 'success',
      });
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      addToast({
        title: 'Missing Fields',
        message: 'Please fill in the project title and a description.',
        type: 'error',
      });
      return;
    }

    const lookingForList = formData.lookingFor
      ? formData.lookingFor.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Collaborators'];

    createProject({
      title: formData.title,
      department: formData.department,
      category: formData.category,
      description: formData.description,
      lookingFor: lookingForList,
      spotsTotal: Number(formData.spotsTotal) || 4,
      tag: 'Student Initiative',
      deadline: 'End of Semester',
    });

    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      department: 'Computer Science & Engineering',
      category: 'Mobile & Web',
      description: '',
      lookingFor: '',
      spotsTotal: 4,
    });

    addToast({
      title: 'Project Posted!',
      message: 'Your project partner request is now live for all students to discover.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#DC2626]" />
            Project Partner Finder
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Collaborate on capstone projects, hackathons, and research initiatives with talented peers.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Post a Project
        </Button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('open')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'open'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Open Spots Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mine')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              My Projects ({joinedProjects.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <Input
              icon={Search}
              placeholder="Search projects or roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#737373] font-medium shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-neutral-100 text-[#737373] hover:bg-neutral-200 hover:text-[#171717]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No projects match your search"
          description="Try adjusting your keywords, changing categories, or post your own project request to recruit teammates."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setActiveTab('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => {
            const isJoined = joinedProjects.includes(project.id);
            const remainingSpots = project.spotsTotal - project.spotsFilled;
            const isFull = remainingSpots <= 0;

            return (
              <Card key={project.id} className="flex flex-col justify-between hover:border-[#DC2626]/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm">
                          {project.category}
                        </Badge>
                        <span className="text-[11px] text-[#737373] font-medium">
                          {project.department}
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-lg mt-1">
                        {project.title}
                      </CardTitle>
                    </div>

                    <Badge
                      variant={isFull ? 'secondary' : remainingSpots === 1 ? 'warning' : 'success'}
                      size="sm"
                    >
                      {isFull ? 'Team Full' : `${remainingSpots} spot${remainingSpots > 1 ? 's' : ''} left`}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3 mt-2 text-xs">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Seeking Roles */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#171717] block mb-1.5">
                      Looking for skills & roles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.lookingFor.map((role) => (
                        <span
                          key={role}
                          className="text-[11px] bg-[#FEF2F2] text-[#DC2626] font-medium px-2 py-0.5 rounded-md border border-[#FECACA]"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.teamMembers.map((member, i) => (
                          <Avatar
                            key={i}
                            src={member.avatar}
                            name={member.name}
                            size="sm"
                            title={`${member.name} (${member.role})`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#737373]">
                        {project.spotsFilled}/{project.spotsTotal} members
                      </span>
                    </div>

                    <span className="text-[11px] text-[#A3A3A3]">
                      Posted {project.postedAt}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="bg-[#FAFAFA]">
                  <div className="text-[11px] text-[#737373] flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Target: {project.deadline || 'This Semester'}</span>
                  </div>

                  <Button
                    size="sm"
                    variant={isJoined ? 'secondary' : isFull ? 'outline' : 'primary'}
                    disabled={isJoined || isFull}
                    onClick={() => handleJoin(project.id, project.title)}
                  >
                    {isJoined ? 'Joined Team' : isFull ? 'Applications Closed' : 'Join Team'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Project Teammate Request"
        description="Fill out the project details so prospective collaborators can discover your idea and apply."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateSubmit}>
              Publish Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
          <Input
            label="Project Title"
            required
            placeholder="e.g., Campus Autonomous Delivery Rover"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                'Mobile & Web',
                'Hardware & IoT',
                'AI & Health',
                'Robotics',
                'Interdisciplinary',
              ]}
            />

            <Input
              label="Total Team Capacity"
              type="number"
              min="2"
              max="10"
              value={formData.spotsTotal}
              onChange={(e) => setFormData({ ...formData, spotsTotal: e.target.value })}
            />
          </div>

          <Input
            label="Department / Faculty"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1.5">
              Project Description & Goals <span className="text-[#DC2626]">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Outline what you are building, technologies used, and timeline expectations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-sm rounded-lg bg-white border border-[#E5E5E5] p-3 focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
            />
          </div>

          <Input
            label="Roles Needed (comma separated)"
            placeholder="e.g., UI/UX Designer, Python Backend, Hardware PCB"
            helperText="Separate multiple roles with commas"
            value={formData.lookingFor}
            onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
