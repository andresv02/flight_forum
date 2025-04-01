'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // First try to get existing profile
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If no profile exists, create one
      if (error?.code === 'PGRST116' || !data) { // PGRST116 = resource not found
        // Extract the email prefix (e.g., "john" from "john@example.com")
        let baseUsername = user.email.split('@')[0].toLowerCase();
        let username = baseUsername;
        let suffix = 1;

        // Check if the username already exists, and append a suffix if needed
        while (true) {
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError; // Handle unexpected errors
          }

          if (!existingUser) {
            break; // Username is unique, proceed with it
          }

          // Username exists, append a suffix and try again
          username = `${baseUsername}_${suffix}`;
          suffix++;
        }

        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            username: username, // Use the unique username
            full_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        data = newProfile;
      } else if (error) {
        throw error;
      }
      
      setProfile(data);
      setUsername(data?.username || '');
      setFullName(data?.full_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error.message, error.details, error);
      setError('Failed to load profile. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user profile on component mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Update user profile
  const updateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setUpdating(true);
    
    try {
      // Check if the new username is unique (if it’s changed)
      if (username !== profile.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingUser && existingUser.id !== user.id) {
          throw new Error('Username is already taken. Please choose a different one.');
        }
      }

      const updates = {
        username,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      setMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error.message, error.details, error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-center">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Profile</h2>
        <button
          onClick={handleSignOut}
          className="text-red-600 hover:text-red-800"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 dark:bg-opacity-20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-20 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full p-2 border rounded bg-gray-100 text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                        />
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-700 dark:text-gray-200 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-gray-700 dark:text-gray-200 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setUsername(profile?.username || '');
                setFullName(profile?.full_name || '');
              }}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-gray-500 dark:text-gray-300">Email</p>
            <p className="font-medium break-all">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-300">Username</p>
            <p className="font-medium break-all">{profile?.username || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-300">Full Name</p>
            <p className="font-medium break-all">{profile?.full_name || 'Not set'}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}