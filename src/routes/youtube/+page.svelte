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
      apiKey = '';
      channelName = '';
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

<style>
  form {
    width: 500px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
  }

  div {
    margin-bottom: 10px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  input[type="text"] {
    width: 100%;
    padding: 8px 0px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    display: block;
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
  }

  button:disabled {
    background-color: #ccc;
  }
</style>

<form on:submit|preventDefault={handleSubmit}>
  <div>
    <label for="apiKey">API Key를 입력해주세요.</label>
    <input type="text" id="apiKey" bind:value={apiKey} />
  </div>
  <div>
    <label for="channelName">데이터 조회할 채널 name을 입력해주세요.</label>
    <input type="text" id="channelName" bind:value={channelName} />
  </div>
  <button type="submit" disabled={downloading}>Download CSV</button>
</form>
