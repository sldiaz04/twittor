importScripts('js/sw-utils.js');

const STATIC_CACHE =  'static-v4';
const DYNAMIC_CACHE =  'dynamic-v2';
const INMUTABLE_CACHE =  'inmutable-v1';

const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

self.addEventListener('install', e => {
    const staticCache = caches.open(STATIC_CACHE)
        .then(cache => {
            cache.addAll(APP_SHELL);
        });

    const inmutableCache = caches.open(INMUTABLE_CACHE)
    .then(cache => {
        cache.addAll(APP_SHELL_INMUTABLE);
    });
    
    e.waitUntil(Promise.all([staticCache, inmutableCache]));
});

self.addEventListener('activate', e => {
    const deleteAllOldStaticCache = caches.keys()
        .then(keys => {
            keys.forEach( key => {
                if (key.includes('static-v') && key !== STATIC_CACHE) {
                    return caches.delete(key);
                }
                if (key.includes('dynamic-v') && key !== DYNAMIC_CACHE) {
                    return caches.delete(key);
                }
            });
        });
    e.waitUntil(deleteAllOldStaticCache);
});

self.addEventListener('fetch', e => {
    const response = caches.match(e.request)
        .then(resp => {
            if (resp) {
                return resp;
            }else{
                console.log(e.request.url);
                return fetch(e.request).then(newResp => {
                     return updateDynamicCache(DYNAMIC_CACHE, e.request, newResp);
                });
            }
        });

    e.respondWith(response);
});