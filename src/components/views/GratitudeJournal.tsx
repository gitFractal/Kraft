import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Heart } from 'lucide-react';

interface Entry {
  id: string;
  date: string;
  content: string;
}

export default function GratitudeJournal() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: '1', date: '2026-03-12', content: 'Grateful for a sunny afternoon walk and a good cup of coffee.' },
    { id: '2', date: '2026-03-11', content: 'Thankful for finishing that big project at work.' },
  ]);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !content.trim()) return;
    
    const newEntry = { id: Date.now().toString(), date, content };
    setEntries([newEntry, ...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setContent('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gratitude Journal</CardTitle>
          <CardDescription>Take a moment to reflect on what you appreciate today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="max-w-[200px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">What are you grateful for?</label>
              <textarea 
                className="flex w-full rounded-xl bg-gray-100 dim:bg-[#3d3d3d] dark:bg-[#242424] px-3 py-2 text-[16px] md:text-sm text-gray-900 dim:text-gray-100 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors min-h-[120px] resize-y"
                placeholder="Today I am grateful for..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <Heart className="mr-2 h-4 w-4" /> Save Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dim:text-white dark:text-white">Past Entries</h3>
        {entries.length === 0 ? (
          <p className="text-gray-500">No entries yet. Start writing!</p>
        ) : (
          entries.map(entry => (
            <Card key={entry.id}>
              <CardContent className="p-5">
                <div className="text-sm font-medium text-gray-500 dim:text-gray-400 dark:text-gray-400 mb-2">
                  {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <p className="text-gray-800 dim:text-gray-200 dark:text-gray-200 whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
