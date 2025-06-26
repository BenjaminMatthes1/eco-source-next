/* ----------------------------------------------------------------
   pages/profile/EditProfilePage.tsx – full rewrite  ❄ v2 2025‑04‑21
   ----------------------------------------------------------------*/
   'use client';

   import React, { useEffect, useState } from 'react';
   import axios from 'axios';
   import { useSession } from 'next-auth/react';
   import { useRouter } from 'next/navigation';
   import { dropdownListStyle } from '@/utils/selectStyles';
   import PhotoPicker from '@/components/forms/PhotoPicker';
   
   /* ─────────────────────────────────────────────────────────────── */
   interface IUserPreferences {
     newsletter: boolean;
     allowMessages: boolean;
     showPublicScore: boolean;
     preferredUnits: 'metric' | 'imperial';
     preferredMarkets: string[];
     linkedin?: string;
     website?: string;
   }
   
   interface IUser {
     _id: string;
     name?: string;
     bio?: string;
     companyName?: string;
     location?: string;
     preferences: IUserPreferences;
     profilePictureUrl?: string;
   }
   
   /* ─────────────────────────────────────────────────────────────── */
   const EditProfilePage: React.FC = () => {
     /* session / router */
     const { data: session } = useSession();
     const router = useRouter();
     const userId = session?.user?.id;
   
     /* global state */
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [successMsg, setSuccessMsg] = useState('');   // ← add this
   
     /* user fields */
     const [name, setName] = useState('');
     const [bio, setBio] = useState('');
     const [companyName, setCompanyName] = useState('');
     const [location, setLocation] = useState('');
     const [prefs, setPrefs] = useState<IUserPreferences>({
       newsletter: false,
       allowMessages: true,
       showPublicScore: true,
       preferredUnits: 'metric',
       preferredMarkets: [],
       linkedin: '',
       website: '',
     });
     const [businessSize, setBusinessSize] = useState<'micro' | 'small' | 'medium' | 'large'>('small');
   
     /* avatar */
     const [avatarFile, setAvatarFile] = useState<File | null>(null);
     const [avatarMsg, setAvatarMsg] = useState('');
   
     /* password */
     const [currentPassword, setCurrentPassword] = useState('');
     const [newPassword, setNewPassword] = useState('');
     const [passwordMsg, setPasswordMsg] = useState('');
   
     /* name availability */
     const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
     
   
     /* ───────── Fetch user on mount ───────── */
     useEffect(() => {
       if (!userId) return setLoading(false);
   
       (async () => {
         try {
           const { data } = await axios.get(`/api/users/${userId}`);
           const u: IUser = data.user;
           setName(u.name ?? '');
           setBio(u.bio ?? '');
           setCompanyName(u.companyName ?? '');
           setLocation(u.location ?? '');
           setPrefs({ ...prefs, ...u.preferences });
           setBusinessSize((u as any).businessSize ?? 'small');
         } catch (err) {
           console.error(err);
           setError('Failed to load profile.');
         } finally {
           setLoading(false);
         }
         
       })();
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [userId]);
   
     if (loading) return <p className="m-6">Loading…</p>;
   
     /* ───────── Helpers ───────── */
     const checkName = async (val: string) => {
       setName(val);
       if (!val.trim()) return setNameAvailable(null);
       try {
         const { data } = await axios.get('/api/users/check-name', {
           params: { name: val.trim() },
         });
         setNameAvailable(data.available);
       } catch {
         setNameAvailable(null);
       }
     };
   
     /* ───────── Handlers ───────── */
     const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccessMsg('');                 // clear any previous notice
      try {
        await axios.put(`/api/users/${userId}`, {
          name,
          bio,
          companyName,
          location,
          preferences: prefs,
          businessSize,
        });
        setSuccessMsg('Profile updated successfully!'); // ← show note
        router.refresh();                               // ← refresh data
        setTimeout(() => setSuccessMsg(''), 4000);      // auto‑hide
      } catch (err) {
        console.error(err);
        setError('Failed to update profile.');
      }
    };
   
     const handleAvatarUpload = async () => {
       if (!avatarFile) return setAvatarMsg('Choose a file first');
       setAvatarMsg('');
       const fd = new FormData();
       fd.append('file', avatarFile);
       try {
         await fetch(`/api/users/${userId}/avatar`, { method: 'POST', body: fd });
         setAvatarMsg('Avatar updated!');
         setAvatarFile(null);
       } catch {
         setAvatarMsg('Avatar upload failed');
       }
     };
   
     const handlePassword = async (e: React.FormEvent) => {
       e.preventDefault();
       setPasswordMsg('');
       try {
         await axios.put(`/api/users/${userId}/password`, {
           currentPassword,
           newPassword,
         });
         setPasswordMsg('Password updated');
         setCurrentPassword('');
         setNewPassword('');
       } catch (err: any) {
         const msg = err.response?.data?.message ?? 'Password change failed';
         setPasswordMsg(msg);
       }
     };
   
     /* ───────── UI ───────── */
     return (
       <div className="max-w-3xl mx-auto py-8">
         <h1 className="text-3xl font-bold text-primary mb-6">Edit Profile</h1>
   
         {error && <p className="text-red-400 mb-4">{error}</p>}
         {successMsg && <p className="mb-4 text-secondary text-lg">{successMsg}</p>}   
   
         {/* ── Basic Info ── */}
         <form onSubmit={handleSave} className="space-y-6 bg-primary/90 p-6 rounded-lg shadow-lg">
           {/* name */}
           <div>
             <label className="block text-sm font-medium text-white mb-1">Name</label>
             <input
               type="text"
               value={name}
               onChange={(e) => checkName(e.target.value)}
               className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
             />
             {nameAvailable === false && (
               <p className="text-red-300 text-xs mt-1">Name already taken</p>
             )}
           </div>
   
           {/* bio */}
           <div>
             <label className="block text-sm font-medium text-white mb-1">Bio</label>
             <textarea
               rows={3}
               value={bio}
               onChange={(e) => setBio(e.target.value)}
               className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
             />
           </div>
   
           {/* company */}
           <div>
             <label className="block text-sm font-medium text-white mb-1">Company</label>
             <input
               type="text"
               value={companyName}
               onChange={(e) => setCompanyName(e.target.value)}
               className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
             />
           </div>

          {/* Business Size */}
           <div>
            <label className="block text-sm font-medium text-white mb-1">Business Size</label>
            <select
              value={businessSize}
              onChange={(e) => setBusinessSize(e.target.value as any)}
              className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
            >
              <option value="micro">Micro (&lt; 10 employees)</option>
              <option value="small">Small (10–49)</option>
              <option value="medium">Medium (50–249)</option>
              <option value="large">Large (250+)</option>
            </select>
          </div>
   
           {/* location */}
           <div>
             <label className="block text-sm font-medium text-white mb-1">Location</label>
             <input
               type="text"
               value={location}
               onChange={(e) => setLocation(e.target.value)}
               className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
             />
           </div>
   
           {/* additional settings */}
           <div className="pt-6 border-t border-white/30">
             <h2 className="text-lg font-semibold text-white mb-4">Additional Settings</h2>
   
             <label className="flex items-center gap-3 text-white mb-4">
               <input
                 type="checkbox"
                 checked={prefs.newsletter}
                 onChange={(e) => setPrefs({ ...prefs, newsletter: e.target.checked })}
                 className="accent-secondary h-4 w-4"
               />
               <span>Subscribe to newsletter</span>
             </label>
   
             <label className="flex items-center gap-3 text-white mb-4">
               <input
                 type="checkbox"
                 checked={prefs.allowMessages}
                 onChange={(e) => setPrefs({ ...prefs, allowMessages: e.target.checked })}
                 className="accent-secondary h-4 w-4"
               />
               <span>Allow direct messages</span>
             </label>
   
             <div className="mb-4">
               <label className="block text-sm font-medium text-white mb-1">LinkedIn URL</label>
               <input
                 type="url"
                 value={prefs.linkedin}
                 onChange={(e) => setPrefs({ ...prefs, linkedin: e.target.value })}
                 className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
               />
             </div>
   
             <div>
               <label className="block text-sm font-medium text-white mb-1">Website</label>
               <input
                 type="url"
                 value={prefs.website}
                 onChange={(e) => setPrefs({ ...prefs, website: e.target.value })}
                 className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
               />
             </div>
           </div>
   
           <button type="submit" disabled={nameAvailable === false} className="btn-primary">
             Save Profile
           </button>
         </form>
   
         {/* ── Avatar (PhotoPicker) ── */}
        <div className="mt-10 bg-primary/90 p-6 rounded-lg shadow-lg space-y-4">
          <h2 className="text-xl font-bold text-white">Avatar</h2>

          <PhotoPicker
            photos={
              session?.user?.profilePictureUrl
                ? [{ _id: 'current', url: session.user.profilePictureUrl }]
                : []
            }
            /* delete avatar = clear in DB  S3 */
            onDelete={async () => {
              await axios.delete(`/api/users/${userId}/avatar`);
              router.refresh();
            }}
            /* upload new avatar (single file) */
            onUpload={async (files) => {
              if (!files.length) return;
              const form = new FormData();
              form.append('file', files[0]);
              form.append('entity', 'user');
              form.append('kind',   'photo');         // mapped to UserPictures/
              const { data } = await axios.post('/api/uploads', form); // { url, key }
              await axios.post(`/api/users/${userId}/avatar`, { url: data.url });
              router.refresh();
            }}
          />
          {avatarMsg && (
            <p className="text-sm text-white/80">{avatarMsg}</p>
          )}
        </div>
   
         {/* ── Password ── */}
         <div className="mt-10 bg-primary/90 p-6 rounded-lg shadow-lg max-w-md">
           <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
           <form onSubmit={handlePassword} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-white mb-1">Current Password</label>
               <input
                 type="password"
                 value={currentPassword}
                 onChange={(e) => setCurrentPassword(e.target.value)}
                 className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-white mb-1">New Password</label>
               <input
                 type="password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 className="block w-full bg-transparent text-white border-b border-white focus:border-secondary focus:outline-none"
               />
             </div>
             <button type="submit" className="btn-secondary">Update Password</button>
           </form>
           {passwordMsg && <p className="text-sm text-white/80 mt-2">{passwordMsg}</p>}
         </div>
       </div>
     );
   };
   
   export default EditProfilePage;
   