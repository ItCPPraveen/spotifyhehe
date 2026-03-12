import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const playlist = await ytmusic.getPlaylist('PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i');
  console.log(playlist);
}
test();
