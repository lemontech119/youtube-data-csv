<script>
  import { getYouTubeChannelData } from './youtube';
  import { jsonToCsv } from './util';

  let apiKey = '';
  let channelName = '';
  let downloading = false;

  const handleSubmit = async () => {
    downloading = true;
    try {
      const data = await getYouTubeChannelData(apiKey, channelName);
      const csv = jsonToCsv(data);
      downloadCSV(csv, `${channelName}.csv`);
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
    } finally {
      downloading = false;
    }
  }

  // @ts-ignore
  const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div>
    <label for="apiKey">API Key:</label>
    <input type="text" id="apiKey" bind:value={apiKey} />
  </div>
  <div>
    <label for="channelName">Channel Name:</label>
    <input type="text" id="channelName" bind:value={channelName} />
  </div>
  <button type="submit" disabled={downloading}>Download CSV</button>
</form>
