import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { io } from 'k6/x/socketio';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export let user_login_counter = new Counter('user_login_counter');
export let user_created_counter = new Counter('user_created_counter');
export let user_getting_details_counter = new Counter('user_getting_details_counter');
export let user_updated_counter = new Counter('user_updated_counter');

export let conversation_created_counter = new Counter('conversation_created_counter');

export let listing_created_counter = new Counter('listing_created_counter');
export let listing_getting_details_counter = new Counter('listing_getting_details_counter');
export let listing_search_counter = new Counter('listing_search_counter');

export let chat_message_sent_counter = new Counter('chat_message_sent_counter');
export let chat_message_received_counter = new Counter('chat_message_received_counter');
export let chat_error_counter = new Counter('chat_error_counter');

export let notification_getting_counter = new Counter('notification_getting_counter');
export let notification_mark_read_counter = new Counter('notification_mark_read_counter');
export let notification_mark_all_read_counter = new Counter('notification_mark_all_read_counter')

export let image_upload_url_counter = new Counter('image_upload_url_counter');
export let image_upload_refused_counter = new Counter('image_upload_refused_counter');
export let image_uploaded_counter = new Counter('image_uploaded_counter');
export let image_thumbnail_download_counter = new Counter('image_thumbnail_download_counter');
export let listing_images_read_counter = new Counter('listing_images_read_counter');
export let image_ready_counter = new Counter('image_ready_counter');
export let image_rejected_counter = new Counter('image_rejected_counter');
export let image_timeout_counter = new Counter('image_timeout_counter');

const user_login_trend = new Trend('user_login_trend', true);
const user_created_trend = new Trend('user_created_trend', true);
const user_getting_details_trend = new Trend('user_getting_details_trend', true);
const user_updated_trend = new Trend('user_updated_trend', true);
const listing_created_trend = new Trend('listing_created_trend', true);
const listing_getting_details_trend = new Trend('listing_getting_details_trend', true);
const image_upload_url_trend = new Trend('image_upload_url_trend', true);
const image_upload_trend = new Trend('image_upload_trend', true);
// from the end of the upload until the Lambda's result can be read
const image_processing_trend = new Trend('image_processing_trend', true);
const image_thumbnail_download_trend = new Trend('image_thumbnail_download_trend', true);
const listing_images_read_trend = new Trend('listing_images_read_trend', true);
// how many valid images end up ready, a timeout counts against it
const image_ready_rate = new Rate('image_ready_rate');

export const options = {
  // Short run for a laptop: about 10 minutes and few users
  scenarios: {
    http_test: {
      executor: 'ramping-vus',
      exec: 'httpTest',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '1m', target: 5 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'gateway' },
    },
    websocket_test: {
      executor: 'ramping-vus',
      exec: 'wsTest',
      stages: [
        { duration: '1m', target: 2 },
        { duration: '2m', target: 5 },
        { duration: '5m', target: 5 },
        { duration: '1m', target: 2 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'chat_socket' },
    },
  },
  // Full load test, commented out for now
  // scenarios: {
  //   http_test: {
  //     executor: 'ramping-vus',
  //     exec: 'httpTest',
  //     stages: [
  //       { duration: '1m', target: 50 },    // warm up
  //       { duration: '2m', target: 150 },   // ramp up fast
  //       { duration: '5m', target: 200 },   // sustain high load
  //       { duration: '3m', target: 300 },   // push hard
  //       { duration: '10m', target: 300 },  // sustain peak - stress test
  //       { duration: '3m', target: 400 },   // push to limit
  //       { duration: '5m', target: 400 },   // sustain limit
  //       { duration: '3m', target: 400 },   // push to limit
  //       { duration: '5m', target: 400 },   // sustain limit
  //       { duration: '1m', target: 0 },
  //     ],
  //     tags: { test_type: 'gateway' },
  //   },
  //   websocket_test: {
  //     executor: 'ramping-vus',
  //     exec: 'wsTest',
  //     stages: [
  //       { duration: '1m', target: 50 },    // warm up
  //       { duration: '2m', target: 100 },   // ramp up
  //       { duration: '5m', target: 200 },   // sustain
  //       { duration: '3m', target: 300 },   // push hard
  //       { duration: '10m', target: 300 },  // sustain peak
  //       { duration: '3m', target: 300 },   // push hard
  //       { duration: '10m', target: 300 },  // sustain peak
  //       { duration: '3m', target: 150 },   // cool down
  //       { duration: '1m', target: 0 },     // ramp down
  //     ],
  //     tags: { test_type: 'chat_socket' },
  //   },
  // },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
    ws_connecting: ['p(95)<1000'],
    'user_login_trend{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
    'user_created_trend{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
    'user_getting_details_trend{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
    'user_updated_trend{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],

    'listing_created_trend{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
    'listing_getting_details_trend{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],

    'image_upload_url_trend{test_type:gateway}': ['p(95)<900'],
    'image_upload_trend{test_type:gateway}': ['p(95)<900'],
    'image_processing_trend{test_type:gateway}': ['p(95)<30000'], // the most the test waits for a result
    'image_thumbnail_download_trend{test_type:gateway}': ['p(95)<900'],
    'listing_images_read_trend{test_type:gateway}': ['p(95)<900'],
    'image_ready_rate{test_type:gateway}': ['rate>0.95'],
  },
};

export function handleSummary(data) {
  return {
    // 'chat.fake.vinted.html': htmlReport(data), // the full load test's report, don't overwrite it from short runs
    'short.fake.vinted.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

const BASE_URL = 'http://fake-vinted.local/api';
const CHAT_URL = 'http://fake-vinted.local/socket';
// Upload and image URLs point at localhost:4566, which inside the k6 container is k6 itself.
// Swapping the host is fine because Floci doesn't validate signatures by default.
const S3_URL = __ENV.S3_URL || 'http://localhost:4566';
const IMAGE_POLL_ATTEMPTS = 30;

// k6/fixtures/test-image.png is a real 300x300 PNG, so it passes every Lambda check
const VALID_IMAGE = open('./k6/fixtures/test-image.png', 'b');
const FAKE_IMAGE = 'this is plain text with a .png name, the Lambda has to reject it';

function s3Url(url) {
  return url.replace(/^https?:\/\/[^/]+/, S3_URL);
}

function imageUploadBody(sizeBytes) {
  return JSON.stringify({ file_name: 'k6-test.png', content_type: 'image/png', size_bytes: sizeBytes });
}

// Uploads a file through the presigned URL, then polls until the Lambda has reported a result
function uploadImage(listingId, body, sizeBytes, headers) {
  const uploadUrlRes = http.post(`${BASE_URL}/listing/${listingId}/images/upload-url`, imageUploadBody(sizeBytes), { headers });
  check(uploadUrlRes, { 'image upload url created': (r) => r.status === 201 });
  image_upload_url_counter.add(1, { test_type: 'gateway' });
  image_upload_url_trend.add(uploadUrlRes.timings.duration, { test_type: 'gateway' });
  if (uploadUrlRes.status !== 201) return null;

  const upload = JSON.parse(uploadUrlRes.body);
  const putRes = http.put(s3Url(upload.upload_url), body, { headers: { 'Content-Type': 'image/png' } });
  check(putRes, { 'image uploaded to s3': (r) => r.status === 200 });
  image_uploaded_counter.add(1, { test_type: 'gateway' });
  image_upload_trend.add(putRes.timings.duration, { test_type: 'gateway' });
  if (putRes.status !== 200) return null;

  const uploadedAt = Date.now();
  for (let attempt = 0; attempt < IMAGE_POLL_ATTEMPTS; attempt++) {
    sleep(1);
    const statusRes = http.get(`${BASE_URL}/listing/${listingId}/images/${upload.image_id}`, { headers });
    if (statusRes.status === 200) {
      const image = JSON.parse(statusRes.body);
      if (image.status !== 'pending') {
        image_processing_trend.add(Date.now() - uploadedAt, { test_type: 'gateway' });
        return image;
      }
    }
  }

  image_timeout_counter.add(1, { test_type: 'gateway' });
  return null;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const conditions = ['new', 'like_new', 'good', 'fair'];
const categories = ['shoes', 'clothes', 'accessories', 'bags'];
const searchTerms = ['nike', 'test', 'item', 'brand', 'zagreb', 'clothes', 'shoes', 'bag'];
const names = ["Alice", "Bob", "Charlie", "David", "Eve"];
const countries = [
  "United States", "Canada", "Mexico", "Brazil", "Argentina",
  "United Kingdom", "France", "Germany", "Italy", "Spain",
  "India", "China", "Japan", "Australia", "New Zealand"
];

const cities = [
  "New York", "Los Angeles", "Chicago",
  "Houston", "Phoenix", "Toronto", "Vancouver",
  "Montreal", "Mexico City", "Guadalajara", "London",
  "Paris", "Berlin", "Rome", "Madrid", "Mumbai", "Delhi",
  "Tokyo", "Beijing", "Seoul", "Sydney", "Auckland"
];

// --- SETUP: runs once before the test ---
export function setup() {
  let registerRes;
  registerRes = http.post(
    `${BASE_URL}/users`,
    JSON.stringify({
      email: `${randomItem(names)}_${Date.now()}@fakevinted.com`,
      password: 'Test1234!',
      username: `${randomItem(names)}_${Date.now()}`,
      full_name: randomItem(names),
      city: randomItem(cities),
      country: randomItem(countries),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(registerRes, { 'user registered': (r) => r.status === 201 });
  user_created_counter.add(1), { test_type: 'gateway' };
  user_created_trend.add(registerRes.timings.duration, { test_type: 'gateway' });

  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      username: JSON.parse(registerRes.body).username,
      password: 'Test1234!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(loginRes, { 'login successful': (r) => r.status === 201 });
  user_login_counter.add(1), { test_type: 'gateway' };
  user_login_trend.add(loginRes.timings.duration, { test_type: 'gateway' });

  let token, userId;
  try {
    token = JSON.parse(loginRes.body).access_token;
    userId = JSON.parse(registerRes.body).id;
  } catch (error) {
    return false;
  }

  // create a conversation to use in ws test
  const createConversationRes = http.post(
    `${BASE_URL}/chat-vinted/conversations`,
    JSON.stringify({
      listing_id: 1,
      buyer_id: userId,
      seller_id: 1,
    }),
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } },
  );

  console.log('conversation response:', createConversationRes.body);
  const conversationId = JSON.parse(createConversationRes.body)?.id ?? 1;
  console.log('conversationId:', conversationId);

  return { token, userId, conversationId };
}

// --- HTTP TEST ---
export function httpTest(data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };
  let createListingRes, listingId;

  // 1. create a listing
  group('testing creating a listing', function () {
    createListingRes = http.post(
      `${BASE_URL}/listing`,
      JSON.stringify({
        user_id: data.userId,
        title: `Test Item ${Date.now()}`,
        description: 'This is a test listing created by k6 load test',
        price: Math.floor(Math.random() * 100) + 1,
        category: randomItem(categories),
        brand: 'TestBrand',
        size: randomItem(sizes),
        condition: randomItem(conditions),
        status: 'available',
        location: 'Zagreb',
      }),
      { headers },
    );

    check(createListingRes, { 'listing created': (r) => r.status === 201 });
    listing_created_counter.add(1, { test_type: 'gateway' });
    listing_created_trend.add(createListingRes.timings.duration, { test_type: 'gateway' });
  });

  sleep(1);

  // 2. listing images: instant validation, presigned upload and the Lambda's result
  group('testing listing images', function () {
    let imageListingId;
    try {
      imageListingId = JSON.parse(createListingRes.body)?.id;
    } catch (e) {
      console.error('listing parse error:', createListingRes.status);
    }
    if (!imageListingId) return;

    // a 400 is the correct answer here, so it shouldn't count as a failed request
    const tooLargeRes = http.post(
      `${BASE_URL}/listing/${imageListingId}/images/upload-url`,
      imageUploadBody(5 * 1024 * 1024),
      { headers, responseCallback: http.expectedStatuses(400) },
    );
    check(tooLargeRes, {
      'image over 4 MB refused': (r) => r.status === 400,
      'refusal says why': (r) => r.status === 400 && JSON.parse(r.body).errors?.[0]?.code === 'FILE_TOO_LARGE',
    });
    image_upload_refused_counter.add(1, { test_type: 'gateway' });

    const image = uploadImage(imageListingId, VALID_IMAGE, VALID_IMAGE.byteLength, headers);
    check(image, {
      'valid image ready': (i) => i?.status === 'ready',
      'valid image has thumbnail': (i) => !!i?.thumbnail_url,
    });
    image_ready_rate.add(image?.status === 'ready', { test_type: 'gateway' });
    if (image?.status === 'ready') {
      image_ready_counter.add(1, { test_type: 'gateway' });

      const thumbnailRes = http.get(s3Url(image.thumbnail_url));
      check(thumbnailRes, { 'thumbnail can be downloaded': (r) => r.status === 200 });
      image_thumbnail_download_counter.add(1, { test_type: 'gateway' });
      image_thumbnail_download_trend.add(thumbnailRes.timings.duration, { test_type: 'gateway' });

      // the image has to show up on the listing itself
      const listingRes = http.get(`${BASE_URL}/listing/${imageListingId}`, { headers });
      check(listingRes, {
        'listing shows its image': (r) => r.status === 200 && JSON.parse(r.body).images?.some((i) => i.id === image.id),
      });
      listing_images_read_counter.add(1, { test_type: 'gateway' });
      listing_images_read_trend.add(listingRes.timings.duration, { test_type: 'gateway' });
    }

    // every 5th iteration also sends a fake image
    if (__ITER % 5 === 0) {
      const rejected = uploadImage(imageListingId, FAKE_IMAGE, FAKE_IMAGE.length, headers);
      check(rejected, {
        'fake image rejected': (i) => i?.status === 'rejected',
        'rejection says why': (i) => i?.rejection_code === 'UNSUPPORTED_FORMAT' && !!i?.message,
      });
      if (rejected?.status === 'rejected') {
        image_rejected_counter.add(1, { test_type: 'gateway' });
      }
    }
  });

  sleep(1);

  // 3. get listing by id
  group('testing gettin details of lising', function () {
    try {
      listingId = JSON.parse(createListingRes.body)?.id;
    } catch (e) {
      console.error('listing parse error:', createListingRes.status, createListingRes.body.substring(0, 100));
    }
    if (listingId) {
      const getListingRes = http.get(`${BASE_URL}/listing/${listingId}`, { headers });
      check(getListingRes, { 'got listing by id': (r) => r.status === 200 });
      listing_getting_details_counter.add(1, { test_type: 'gateway' });
      listing_getting_details_trend.add(getListingRes.timings.duration, { test_type: 'gateway' });
    }
  });


  group('testing gettin details of lising', function () {
    listingId = JSON.parse(createListingRes.body)?.id;
    if (listingId) {
      const getListingRes = http.get(`${BASE_URL}/listing/${listingId}`, { headers });
      check(getListingRes, { 'got listing by id': (r) => r.status === 200 });
      listing_getting_details_counter.add(1, { test_type: 'gateway' });
      listing_getting_details_trend.add(getListingRes.timings.duration, { test_type: 'gateway' });
    }
  });

  sleep(1);

  // 4. get user by id
  group('testing get user details', function () {
    const getUserRes = http.get(`${BASE_URL}/users/${data.userId}`, { headers });
    check(getUserRes, { 'got user by id': (r) => r.status === 200 });
    user_getting_details_counter.add(1, { test_type: 'gateway' });
    user_getting_details_trend.add(getUserRes.timings.duration, { test_type: 'gateway' });
  });

  sleep(1);


  // 3. search listings
  group('testing search listings', function () {
    const searchTerm = randomItem(searchTerms);
    const randomCategory = randomItem(categories);
    const randomCondition = randomItem(conditions);

    // search with different combinations randomly
    const searchVariant = Math.floor(Math.random() * 4);
    let searchUrl;

    switch (searchVariant) {
      case 0:
        // full text search only
        searchUrl = `${BASE_URL}/listing/search?q=${searchTerm}&page=1&limit=10&userId=${data.userId}`;
        break;
      case 1:
        // search with category filter
        searchUrl = `${BASE_URL}/listing/search?q=${searchTerm}&category=${randomCategory}&page=1&limit=10&userId=${data.userId}`;
        break;
      case 2:
        // search with price range
        searchUrl = `${BASE_URL}/listing/search?q=${searchTerm}&min_price=10&max_price=80&page=1&limit=10&userId=${data.userId}`;
        break;
      case 3:
        // search with condition and category
        searchUrl = `${BASE_URL}/listing/search?category=${randomCategory}&condition=${randomCondition}&page=1&limit=20&userId=${data.userId}`;
        break;
    }


    const searchRes = http.get(searchUrl, { headers });
    console.log('search status:', searchRes?.status);
    console.log('search body:', searchRes?.body);
    check(searchRes, {
      'search returned 200': (r) => r.status === 200,
      'search returned data': (r) => {
        if (r.status !== 200) return false;
        try {
          const body = JSON.parse(r.body);
          return body.data !== undefined && body.total !== undefined;
        } catch (e) {
          console.log('searchRes----------------> down');
          console.log(searchRes);
          return false;
        }
      },
    });
    listing_search_counter.add(1, { test_type: 'gateway' });
  });

  sleep(1);

  group('testing updating an user', function () {
    // 5. update user
    const updateUserRes = http.put(
      `${BASE_URL}/users/${data.userId}`,
      JSON.stringify({ bio: 'Updated bio from k6 test' }),
      { headers },
    );
    check(updateUserRes, { 'user updated': (r) => r.status === 200 });
    user_updated_counter.add(1, { test_type: 'gateway' });
    user_updated_trend.add(updateUserRes.timings.duration, { test_type: 'gateway' });
  });

  sleep(1);

  group('testing creating a conversation', function () {
    // 6. create conversation
    const createConversationRes = http.post(
      `${BASE_URL}/chat-vinted/conversations`,
      JSON.stringify({
        listing_id: listingId ?? 1,
        buyer_id: data.userId,
        seller_id: 1,
      }),
      { headers },
    );

    check(createConversationRes, { 'conversation created': (r) => r.status === 201 });
    conversation_created_counter.add(1, { test_type: 'gateway' });
  });

  sleep(1);

  // 6. get user notifications
  group('testing getting user notifications', function () {
    const getNotificationsRes = http.get(
      `${BASE_URL}/notifications/user/${data.userId}`,
      { headers },
    );
    check(getNotificationsRes, { 'got notifications': (r) => r.status === 200 });
    notification_getting_counter.add(1, { test_type: 'gateway' });

    // if notifications exist mark first one as read
    let notifications = [];
    try {
      notifications = JSON.parse(getNotificationsRes.body);
    } catch (e) {
      console.error('notifications parse error:', getNotificationsRes.status, getNotificationsRes.body.substring(0, 100));
    }

    if (Array.isArray(notifications) && notifications.length > 0) {
      const notificationId = notifications[0].id;
      group('testing mark notification as read', function () {
        const markReadRes = http.patch(
          `${BASE_URL}/notifications/${notificationId}/read`,
          null,
          { headers },
        );
        check(markReadRes, { 'notification marked as read': (r) => r.status === 200 });
        notification_mark_read_counter.add(1, { test_type: 'gateway' });
      });
    }
  });

  group('testing getting user notifications', function () {
    const getNotificationsRes = http.get(
      `${BASE_URL}/notifications/user/${data.userId}`,
      { headers },
    );
    check(getNotificationsRes, { 'got notifications': (r) => r.status === 200 });
    notification_getting_counter.add(1, { test_type: 'gateway' });

    // if notifications exist mark first one as read
    const notifications = JSON.parse(getNotificationsRes.body);
    if (Array.isArray(notifications) && notifications.length > 0) {
      const notificationId = notifications[0].id;

      group('testing mark notification as read', function () {
        const markReadRes = http.patch(
          `${BASE_URL}/notifications/${notificationId}/read`,
          null,
          { headers },
        );
        check(markReadRes, { 'notification marked as read': (r) => r.status === 200 });
        notification_mark_read_counter.add(1, { test_type: 'gateway' });
      });
    }
  });

  sleep(1);

  // 7. mark all notifications as read
  group('testing mark all notifications as read', function () {
    const markAllReadRes = http.patch(
      `${BASE_URL}/notifications/user/${data.userId}/read-all`,
      null,
      { headers },
    );

    console.log('mark all read status:', markAllReadRes.status);
    console.log('mark all read body:', markAllReadRes.body);
    check(markAllReadRes, { 'all notifications marked as read': (r) => r.status === 200 });
    notification_mark_all_read_counter.add(1, { test_type: 'gateway' });
  });

  sleep(1);
}

// --- WEBSOCKET TEST ---
export function wsTest(data) {
  const options = {
    path: '/socket.io/',
    namespace: '/chat',
    params: {
      tags: { scenario: 'WebSocketChat' },
    },
  };

  group('testing socket connection and chat messaging', function () {
    const startTime = Date.now();

    io(CHAT_URL, options, (socket) => {
      socket.on('connect', () => {
        console.log(`VU ${__VU} using conversationId: ${data.conversationId}`);
        check(true, { 'socket connected': (v) => v === true });

        // join conversation
        console.log(`${__VU} user wirh conversationI: ${data.conversationId}`);
        socket.emit('joinConversation', data.conversationId);
      });

      socket.on('joinedConversation', (msg) => {
        check(true, { 'joined conversation': (v) => v === true });
        console.log(`VU ${__VU} joined conversation`, msg);
        console.log(`VU ${__VU} sending message with conversation_id: ${data.conversationId}`);
        // send message after joining
        socket.emit('sendMessage', {
          conversation_id: data.conversationId,
          sender_id: data.userId,
          content: `Hello from k6 VU ${__VU} at ${Date.now()}`,
        });
        chat_message_sent_counter.add(1, { test_type: 'chat_socket' });
      });

      socket.on('newMessage', (msg) => {
        const duration = Date.now() - startTime;
        chat_message_received_counter.add(1, { test_type: 'chat_socket' });
        const message = Array.isArray(msg) ? msg[0] : msg;
        check(message, {
          'message received': (m) => m !== undefined,
          'message has content': (m) => m?.content !== undefined,
          'message has sender': (m) => m?.sender_id !== undefined,
          'message has conversation': (m) => m?.conversation_id !== undefined,
        });

        console.log(`VU ${__VU} received message`, msg);
        socket.close();
      });

      socket.on('disconnect', () => {
        check(true, { 'socket disconnected': (v) => v === true });
        console.log(`VU ${__VU} disconnected`);
        socket.close();
      });

      socket.on('error', (err) => {
        console.error(`VU ${__VU} socket error:`, err);
        chat_error_counter.add(1, { test_type: 'chat_socket' });
        socket.close();
      });
    });

    sleep(30);
  });
}

// --- TEARDOWN ---
export function teardown(data) {
  console.log('Load test completed!');

  group('deleting all from users, listing, messages notifications and conversations tables', function () {
    const deletetingMsgConvts = http.del(
      `${BASE_URL}/chat-vinted/truncate`,
      { headers: { 'Content-Type': 'application/json' } },
    );
    const deletetingUsers = http.del(
      `${BASE_URL}/users/truncate`,
      { headers: { 'Content-Type': 'application/json' } },
    );

    const deletetingListing = http.del(
      `${BASE_URL}/listing/truncate`,
      { headers: { 'Content-Type': 'application/json' } },
    );

    const deletetingNotifications = http.del(
      `${BASE_URL}/notifications/truncate`,
      { headers: { 'Content-Type': 'application/json' } },
    );
  });

  console.log(`${__VU} deleted all data from database`);
}