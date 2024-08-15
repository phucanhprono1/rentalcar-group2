import { TruncateLongNamePipe } from './truncate-long-name.pipe';

describe('TruncateLongNamePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateLongNamePipe();
    expect(pipe).toBeTruthy();
  });
});
