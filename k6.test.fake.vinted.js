import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { io } from 'k6/x/socketio';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export let user_login_counter = new Counter('user_login_counter');
export let user_created_counter = new Counter('user_created_counter');
export let user_getting_details_counter = new Counter('user_getting_details_counter');
export let user_updated_counter = new Counter('user_updated_counter');

export let conversation_created_counter = new Counter('conversation_created_counter');

export let listing_created_counter = new Counter('listing_created_counter');
export let listing_getting_all_counter = new Counter('listing_getting_all_counter');
export let listing_getting_details_counter = new Counter('listing_getting_details_counter');
export let listing_search_counter = new Counter('listing_search_counter');

export let chat_message_sent_counter = new Counter('chat_message_sent_counter');
export let chat_message_received_counter = new Counter('chat_message_received_counter');
export let chat_error_counter = new Counter('chat_error_counter');

export let notification_getting_counter = new Counter('notification_getting_counter');
export let notification_mark_read_counter = new Counter('notification_mark_read_counter');
export let notification_mark_all_read_counter = new Counter('notification_mark_all_read_counter')

const user_login_trend = new Trend('user_login_trend', true);
const user_created_trend = new Trend('user_created_trend', true);

export const options = {
  scenarios: {
    http_test: {
      executor: 'ramping-vus',
      exec: 'httpTest',
      stages: [
        { duration: '1m', target: 50 },    // warm up
        { duration: '2m', target: 150 },   // ramp up fast
        { duration: '5m', target: 200 },   // sustain high load
        { duration: '3m', target: 300 },   // push hard
        { duration: '10m', target: 300 },  // sustain peak - stress test
        { duration: '3m', target: 400 },   // push to limit
        { duration: '5m', target: 400 },   // sustain limit
        { duration: '3m', target: 400 },   // push to limit
        { duration: '5m', target: 400 },   // sustain limit
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'gateway' },
    },
    websocket_test: {
      executor: 'ramping-vus',
      exec: 'wsTest',
      stages: [
        { duration: '1m', target: 50 },    // warm up
        { duration: '2m', target: 100 },   // ramp up
        { duration: '5m', target: 200 },   // sustain
        { duration: '3m', target: 300 },   // push hard
        { duration: '10m', target: 300 },  // sustain peak
        { duration: '3m', target: 300 },   // push hard
        { duration: '10m', target: 300 },  // sustain peak
        { duration: '3m', target: 150 },   // cool down
        { duration: '1m', target: 0 },     // ramp down
      ],
      tags: { test_type: 'chat_socket' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
    ws_connecting: ['p(95)<1000'],
    /*     'user_login_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
        'user_created_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
        'user_getting_details_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
        'user_updated_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
    
        'listing_created_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
        'listing_getting_all_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
        'listing_getting_details_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
    
        'listing_getting_details_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
        'listing_getting_details_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'],
        'listing_getting_details_counter{test_type:gateway}': ['p(95)<900', 'p(90)<1000'], */

  },
};

export function handleSummary(data) {
  return {
    'chat.fake.vinted.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

const BASE_URL = 'http://localhost:5000';
const CHAT_URL = 'http://localhost:4002';

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
  const registerRes = http.post(
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

  const token = JSON.parse(loginRes.body).access_token;
  const userId = JSON.parse(registerRes.body).id;

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
        images: ['https://example.com/image1.jpg'],
        location: 'Zagreb',
      }),
      { headers },
    );

    check(createListingRes, { 'listing created': (r) => r.status === 201 });
    listing_created_counter.add(1, { test_type: 'gateway' });
  });

  sleep(1);

  // 2. get all listings
  /*   const getAllListingsRes = http.get(`${BASE_URL}/listing`, { headers });
    check(getAllListingsRes, { 'got all listings': (r) => r.status === 200 });
    listing_getting_all_counter.add(1, { test_type: 'gateway' });
    sleep(1); */

  // 3. get listing by id
  group('testing gettin details of lising', function () {
    listingId = JSON.parse(createListingRes.body)?.id;
    if (listingId) {
      const getListingRes = http.get(`${BASE_URL}/listing/${listingId}`, { headers });
      check(getListingRes, { 'got listing by id': (r) => r.status === 200 });
      listing_getting_details_counter.add(1, { test_type: 'gateway' });
    }
  });

  sleep(1);

  // 4. get user by id
  group('testing get user details', function () {
    const getUserRes = http.get(`${BASE_URL}/users/${data.userId}`, { headers });
    check(getUserRes, { 'got user by id': (r) => r.status === 200 });
    user_getting_details_counter.add(1, { test_type: 'gateway' });
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
        searchUrl = `${BASE_URL}/listing/search?q=${searchTerm}&page=1&limit=10`;
        break;
      case 1:
        // search with category filter
        searchUrl = `${BASE_URL}/listing/search?q=${searchTerm}&category=${randomCategory}&page=1&limit=10`;
        break;
      case 2:
        // search with price range
        searchUrl = `${BASE_URL}/listing/search?q=${searchTerm}&min_price=10&max_price=80&page=1&limit=10`;
        break;
      case 3:
        // search with condition and category
        searchUrl = `${BASE_URL}/listing/search?category=${randomCategory}&condition=${randomCondition}&page=1&limit=20`;
        break;
    }

    const searchRes = http.get(searchUrl, { headers });
    check(searchRes, {
      'search returned 200': (r) => r.status === 200,
      'search returned data': (r) => {
        const body = JSON.parse(r.body);
        return body.data !== undefined && body.total !== undefined;
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