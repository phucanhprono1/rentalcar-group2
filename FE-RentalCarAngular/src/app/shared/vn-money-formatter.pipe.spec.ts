import { VnMoneyFormatterPipe } from './vn-money-formatter.pipe';

describe('VnMoneyFormatterPipe', () => {
  it('create an instance', () => {
    const pipe = new VnMoneyFormatterPipe();
    expect(pipe).toBeTruthy();
  });
});
