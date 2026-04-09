const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lfvcnamqymgczynnljds.supabase.co', 'sb_publishable_T-_shwpZDzmhl1h7BSoqIQ_NthED5DM');

async function wipe() {
  const {data} = await supabase.from('messages').select('*');
  if(!data || data.length === 0) {
    console.log('No data');
    return;
  }
  console.log(`Deleting ${data.length} msgs`);
  for(let m of data) {
    await supabase.from('messages').delete().eq('id', m.id);
  }
  console.log('Done cleaning messages!');
}
wipe();
