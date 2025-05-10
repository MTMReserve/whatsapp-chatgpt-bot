// src/services/audioCounter.ts

const audioMessageCountMap = new Map<string, number>();

export function incrementAudioCount(phone: string): number {
  const count = (audioMessageCountMap.get(phone) || 0) + 1;
  audioMessageCountMap.set(phone, count);
  return count;
}

export function resetAudioCount(phone: string): void {
  audioMessageCountMap.set(phone, 0);
}

export function getAudioCount(phone: string): number {
  return audioMessageCountMap.get(phone) || 0;
}
