"use client";

import React, { useEffect, useState } from "react";
import { Member } from "@/types";
import { chatApi } from "@/api/chat";
import { ArrowLeft, Save, Loader, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AgentsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedSystemMessage, setEditedSystemMessage] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const membersList = await chatApi.getAllMembers();
      // Filter to only show PROGRAM type members (AI models)
      const programMembers = membersList.filter(member => member.type === "PROGRAM");
      setMembers(programMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setEditedName(member.name);
    setEditedSystemMessage(member.systemMessage || "");
    setEditedDescription(member.description || "");
    setSaveSuccess(false);
    setError(null);
  };

  const handleSaveMember = async () => {
    if (!selectedMember) return;
    
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const updatedMember = await chatApi.updateMember({
        memberId: selectedMember.id,
        name: editedName,
        systemMessage: editedSystemMessage,
        description: editedDescription
      });
      
      // Update the member in the list
      setMembers(prev => prev.map(m => 
        m.id === updatedMember.id ? updatedMember : m
      ));
      
      setSelectedMember(updatedMember);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link href="/" className="flex items-center text-[#1b2e5c] hover:text-blue-600 mr-4">
            <ArrowLeft size={20} className="mr-2" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1b2e5c]">AI Agent Management</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-[#1b2e5c]" />
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Models List */}
            <div className="w-1/3 bg-white rounded-lg shadow-md p-4 h-[calc(100vh-180px)] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4 text-[#1b2e5c]">Available Agents</h2>
              <div className="space-y-2">
                {members.map(member => (
                  <div 
                    key={member.id}
                    onClick={() => handleSelectMember(member)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedMember?.id === member.id 
                        ? 'bg-[#1b2e5c] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm opacity-80">{member.id}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Edit Panel */}
            <div className="w-2/3 bg-white rounded-lg shadow-md p-6">
              {selectedMember ? (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-[#1b2e5c]">
                    Edit Model: {selectedMember.name}
                  </h2>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  {saveSuccess && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                      Changes saved successfully!
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model ID
                      </label>
                      <input
                        type="text"
                        value={selectedMember.id}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        System Message
                      </label>
                      <textarea
                        value={editedSystemMessage}
                        onChange={(e) => setEditedSystemMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={6}
                        placeholder="Enter system message that defines the model's behavior..."
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        This message defines how the AI model behaves in conversations.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Enter a description of this model..."
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveMember}
                        disabled={saving}
                        className={`px-4 py-2 rounded-md flex items-center text-white ${
                          saving ? 'bg-gray-400' : 'bg-[#1b2e5c] hover:bg-blue-600'
                        }`}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select an agent to configure
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}