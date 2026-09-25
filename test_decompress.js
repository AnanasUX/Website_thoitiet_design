const b64 = 'eJyrVipJLS5RslJQykjNyclXKM8vyklRSCvKz1VIzs8tKEotLs7Mz1NUGJUdlSVPVqkWAKH75Nc='.trim();
async function run() {
  const binaryStr = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryStr.length);
  for(let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  
  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  
  const reader = ds.readable.pipeThrough(new TextDecoderStream()).getReader();
  let text = '';
  while(true) {
    const {value, done} = await reader.read();
    if(done) break;
    text += value;
  }
  console.log(text);
}
run().catch(console.error);