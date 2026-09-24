import test from 'node:test';
import assert from 'node:assert/strict';
import { isOriginalSong } from './youtube.js';

test('filters out Shorts and Reels content', () => {
  assert.equal(isOriginalSong({ snippet: { title: 'Midnight City - Official Audio' } }), true);
  assert.equal(isOriginalSong({ snippet: { title: 'Chill vibes | Shorts' } }), false);
  assert.equal(isOriginalSong({ snippet: { title: 'New song reel edit' } }), false);
  assert.equal(isOriginalSong({ snippet: { title: 'Official Trailer - Movie Preview' } }), false);
});
