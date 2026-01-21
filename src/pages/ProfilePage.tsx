import { useState } from 'react';
import { User } from 'lucide-react';

type Tab = 'account';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  // Mock user data (keeping original credentials)
  const user = {
    initials: 'JD',
    role: 'Administrator',
    email: 'helpdesk@joblogic.com',
    firstName: 'John',
    lastName: 'Doe'
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col items-center pt-8 px-4">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-semibold text-gray-700 mb-3">
          {user.initials}
        </div>
        <span className="text-sm text-gray-600 mb-8">{user.role}</span>

        {/* Navigation Tab */}
        <button
          onClick={() => setActiveTab('account')}
          className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'account'
            ? 'bg-gray-900 text-white'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <User className="h-4 w-4" />
          Account Details
        </button>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Personal Information
          </h2>

          <div className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                First name
              </label>
              <input
                type="text"
                value={user.firstName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Last name
              </label>
              <input
                type="text"
                value={user.lastName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}