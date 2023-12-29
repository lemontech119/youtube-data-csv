import axios from "axios";

export const convertISO8601ToTime = (duration: any): any => {
  try {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    // 시간이 0이 아니면 시간 포함, 그렇지 않으면 분:초 형식으로 반환
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  } catch (error) {
    return "체크가 안됨";
  }
};

export const getChannelId = async (
  apiKey: string,
  channelName: string
): Promise<string | undefined> => {
  try {
    // 채널 검색
    const searchResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channelName}&type=channel&key=${apiKey}`
    );
    const channels = searchResponse.data.items;

    if (channels.length === 0) {
      console.log("No channels found");
      return undefined;
    }

    const channelId: string = channels[0].id.channelId;

    // 검색어의 첫번째 채널 ID 반환
    return channelId;
  } catch (error) {
    console.error("Error searching for channel");
  }
};

export const getPlaylistItems = async (
  apiKey: string,
  playlistId: any,
  nextPageToken = "",
  allVideos: any[] = []
): Promise<any> => {
  const maxResults = 50; // 한 번의 요청으로 가져올 최대 항목 수
  let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;

  if (nextPageToken) {
    url += `&pageToken=${nextPageToken}`;
  }

  try {
    const response = await axios.get(url);
    const items = response.data.items;
    allVideos.push(...items);

    if (response.data.nextPageToken) {
      await getPlaylistItems(
        apiKey,
        playlistId,
        response.data.nextPageToken,
        allVideos
      );
    }

    return allVideos;
  } catch (error) {
    console.error("Error fetching playlist items");
  }
};

export const getVideoDetails = async (
  apiKey: string,
  videoIds: string[]
): Promise<any> => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(
        ","
      )}&key=${apiKey}`
    );
    return response.data.items.reduce((details: any, item: any) => {
      details[item.id] = {
        duration: item.contentDetails.duration,
        viewCount: item.statistics.viewCount, // 조회 수 추가
      };
      return details;
    }, {});
  } catch (error) {
    console.error("Error fetching video details");
  }
};

export const getSubscribersCount = async (
  apiKey: string,
  channelId: string
): Promise<any> => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    );
    return response.data.items[0].statistics.subscriberCount;
  } catch (error) {
    console.error("Error fetching subscribers count");
  }
};

export const getVideoDetailsBatch = async (
  apiKey: string,
  videoIds: any
): Promise<any> => {
  const videoDetails = {};

  // 한 번에 처리할 수 있는 최대 동영상 ID 수
  const batchSize = 50;

  // videoIds 배열을 batchSize 크기의 청크로 분할
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    const batchDetails = await getVideoDetails(apiKey, batch);

    // 결과를 videoDetails 객체에 병합
    Object.assign(videoDetails, batchDetails);
  }

  return videoDetails;
};

export const getYouTubeChannelData = async (
  apiKey: string,
  channelName: string
) => {
  try {
    const channelId = await getChannelId(apiKey, channelName);

    if (!channelId) {
      console.log("Channel not found");
      return;
    }

    const subscribersCount = await getSubscribersCount(apiKey, channelId);

    // 채널의 업로드된 동영상 목록을 가져옴
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    );
    const playlistId =
      response.data.items[0].contentDetails.relatedPlaylists.uploads;

    const videoList = await getPlaylistItems(apiKey, playlistId);

    const videos = videoList.map((item: any) => {
      return {
        // videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title
          .replace(/,/g, "")
          .replace(/\n/g, " ")
          .replace(/\r/g, ""),
        uploadDate: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.high.url,
        description: item.snippet.description
          .replace(/\n/g, " ")
          .replace(/\r/g, "")
          .replace(/,/g, ""),
        // channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle.replace(/,/g, ""),
        subscribersCount,
      };
    });

    const videoIds = videos.map((video: any) => video.videoId);

    const videoDetails = await getVideoDetailsBatch(apiKey, videoIds);

    const detailedVideos = videos.map((video: any) => {
      const details = videoDetails[video.videoId];
      return {
        ...video,
        duration: convertISO8601ToTime(details.duration),
        viewCount: details.viewCount,
      };
    });

    return detailedVideos;
  } catch (error) {
    console.error("Error fetching YouTube data", error);
  }
};
