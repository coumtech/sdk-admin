"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import gameService from '@/services/gameService';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  developer: yup.string().required('Developer is required'),
  description: yup.string().required('Description is required'),
  genre: yup.string().required('Genre is required'),
  price: yup.number().required('Price is required').min(0),
  googleDriveFileId: yup.string().required('Google Drive File ID is required'),
  oauthToken: yup.string().required('OAuth Token is required'),
  cover: yup.mixed<FileList>().required('Cover image is required'),
});

interface GameFormData {
  title: string;
  developer: string;
  description: string;
  genre: string;
  price: number;
  googleDriveFileId: string;
  oauthToken: string;
  cover: FileList;
}

export default function UploadGame() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<GameFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('developer', data.developer);
      formData.append('description', data.description);
      formData.append('genre', data.genre);
      formData.append('price', data.price.toString());
      formData.append('googleDriveFileId', data.googleDriveFileId);
      formData.append('oauthToken', data.oauthToken);
      formData.append('cover', data.cover[0]);

      await gameService.createGame(formData);
      router.push('/admin/games');
    } catch (err) {
      setError('Failed to upload game. Please try again.');
      console.error('Error uploading game:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload New Game</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            {...register('title')}
            className="w-full p-2 border rounded"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Developer</label>
          <input
            type="text"
            {...register('developer')}
            className="w-full p-2 border rounded"
          />
          {errors.developer && (
            <p className="text-red-500 text-sm mt-1">{errors.developer.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Genre</label>
          <input
            type="text"
            {...register('genre')}
            className="w-full p-2 border rounded"
          />
          {errors.genre && (
            <p className="text-red-500 text-sm mt-1">{errors.genre.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            {...register('price')}
            className="w-full p-2 border rounded"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Google Drive File ID</label>
          <input
            type="text"
            {...register('googleDriveFileId')}
            className="w-full p-2 border rounded"
          />
          {errors.googleDriveFileId && (
            <p className="text-red-500 text-sm mt-1">{errors.googleDriveFileId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">OAuth Token</label>
          <input
            type="text"
            {...register('oauthToken')}
            className="w-full p-2 border rounded"
          />
          {errors.oauthToken && (
            <p className="text-red-500 text-sm mt-1">{errors.oauthToken.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            {...register('cover')}
            className="w-full p-2 border rounded"
          />
          {errors.cover && (
            <p className="text-red-500 text-sm mt-1">{errors.cover.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Game'}
          </button>
        </div>
      </form>
    </div>
  );
} 