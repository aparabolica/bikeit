# BikeIT API Documentation

The API is built on [WP REST API](http://wp-api.org) (1.2.3) plugin with some customization built on the theme for platform specific features.

Most of the common API endpoints (retrieving places, reviews, categories and comments) can be seen on the [WP REST API](http://wp-api.org) documentation.

## Retrieving content

## Places

**`GET api/posts?type=place`**

### Parameters

- `filters` [see all the acceptable filters here](http://wp-api.org/#posts_retrieve-posts_input)

### Response

Array of place objects

```json
[{
  "ID": 173,
  "title": "CineSesc",
  "status": "publish",
  "type": "place",
  "author": {
    "ID": 4,
    "username": "peixe.luiza@gmail.com",
    "name": "Luiza Peixe",
    "first_name": "Luiza Peixe",
    "last_name": "",
    "nickname": "Luiza Peixe",
    "slug": "peixe-luizagmail-com",
    "URL": "",
    "avatar": "http:\/\/0.gravatar.com\/avatar\/cf820d4bc34101e78d33f5d7243ff246?s=96",
    "description": "",
    "registered": "2015-08-26T17:41:08+00:00",
    "meta": {
      "links": {
        "self": "http:\/\/www.bikeit.com.br\/api\/users\/4",
        "archives": "http:\/\/www.bikeit.com.br\/api\/users\/4\/posts"
      }
    },
    "votes": {
      "up": 3,
      "down": 0
    },
    "total_reviews": "4"
  },
  "link": "http:\/\/www.bikeit.com.br\/#!\/places\/173\/",
  "date": "2015-08-26T22:02:16",
  "modified": "2015-10-16T23:29:55",
  "format": "standard",
  "slug": "cinesesc-augusta",
  "comment_status": "closed",
  "ping_status": "closed",
  "sticky": false,
  "date_tz": "Etc\/GMT-3",
  "date_gmt": "2015-08-26T22:02:16",
  "modified_tz": "Etc\/GMT-3",
  "modified_gmt": "2015-10-16T23:29:55",
  "meta": {
    "links": {
      "self": "http:\/\/www.bikeit.com.br\/api\/posts\/173",
      "author": "http:\/\/www.bikeit.com.br\/api\/users\/4",
      "collection": "http:\/\/www.bikeit.com.br\/api\/posts",
      "replies": "http:\/\/www.bikeit.com.br\/api\/posts\/173\/comments",
      "version-history": "http:\/\/www.bikeit.com.br\/api\/posts\/173\/revisions"
    }
  },
  "location": {
    "road": "Rua Augusta",
    "number": "2075",
    "district": "Jardim Paulista",
    "lat": -23.563682267794,
    "lng": -46.666086316109
  },
  "formatted_address": "Rua Augusta, 2075 - Jardim Paulista",
  "osm_id": "",
  "stamped": 0,
  "review_count": "3",
  "scores": {
    "approved": "0.33333333333333",
    "structure": "2.6666666666667",
    "kindness": "2.6666666666667"
  },
  "images": [{
    "ID": 174,
    "name": "1476341_573477486053753_66970647_n",
    "source": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n.jpg",
    "attachment_meta": {
      "width": 640,
      "height": 640,
      "file": "2015\/08\/1476341_573477486053753_66970647_n.jpg",
      "sizes": {
        "thumbnail": {
          "file": "1476341_573477486053753_66970647_n-150x150.jpg",
          "width": 150,
          "height": 150,
          "mime-type": "image\/jpeg",
          "url": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-150x150.jpg"
        },
        "medium": {
          "file": "1476341_573477486053753_66970647_n-300x300.jpg",
          "width": 300,
          "height": 300,
          "mime-type": "image\/jpeg",
          "url": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-300x300.jpg"
        }
      },
      "image_meta": {
        "aperture": 0,
        "credit": "",
        "camera": "",
        "caption": "",
        "created_timestamp": 0,
        "copyright": "",
        "focal_length": 0,
        "iso": 0,
        "shutter_speed": 0,
        "title": "",
        "orientation": 0
      }
    },
    "thumb": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-150x150.jpg"
  }],
  "featured_image": {
    "ID": 174,
    "title": "1476341_573477486053753_66970647_n",
    "status": "inherit",
    "type": "attachment",
    "author": {
      "ID": 4,
      "username": "peixe.luiza@gmail.com",
      "name": "Luiza Peixe",
      "first_name": "Luiza Peixe",
      "last_name": "",
      "nickname": "Luiza Peixe",
      "slug": "peixe-luizagmail-com",
      "URL": "",
      "avatar": "http:\/\/0.gravatar.com\/avatar\/cf820d4bc34101e78d33f5d7243ff246?s=96",
      "description": "",
      "registered": "2015-08-26T17:41:08+00:00",
      "meta": {
        "links": {
          "self": "http:\/\/www.bikeit.com.br\/api\/users\/4",
          "archives": "http:\/\/www.bikeit.com.br\/api\/users\/4\/posts"
        }
      },
      "votes": {
        "up": 3,
        "down": 0
      },
      "total_reviews": "4"
    },
    "content": "<p class=\"attachment\"><a href='http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n.jpg'><img width=\"300\" height=\"300\" src=\"http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-300x300.jpg\" class=\"attachment-medium\" alt=\"1476341_573477486053753_66970647_n\" \/><\/a><\/p>\n",
    "link": "http:\/\/www.bikeit.com.br\/#!\/places\/173\/r\/175\/1476341_573477486053753_66970647_n\/",
    "date": "2015-08-26T22:04:25",
    "modified": "2015-08-26T22:07:41",
    "format": "standard",
    "slug": "1476341_573477486053753_66970647_n",
    "comment_status": "open",
    "ping_status": "closed",
    "sticky": false,
    "date_tz": "Etc\/GMT-3",
    "date_gmt": "2015-08-26T22:04:25",
    "modified_tz": "Etc\/GMT-3",
    "modified_gmt": "2015-08-26T22:07:41",
    "meta": {
      "links": {
        "self": "http:\/\/www.bikeit.com.br\/api\/media\/174",
        "author": "http:\/\/www.bikeit.com.br\/api\/users\/4",
        "collection": "http:\/\/www.bikeit.com.br\/api\/media",
        "replies": "http:\/\/www.bikeit.com.br\/api\/media\/174\/comments",
        "version-history": "http:\/\/www.bikeit.com.br\/api\/media\/174\/revisions",
        "up": "http:\/\/www.bikeit.com.br\/api\/media\/175"
      }
    },
    "terms": [],
    "source": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n.jpg",
    "is_image": true,
    "attachment_meta": {
      "width": 640,
      "height": 640,
      "file": "2015\/08\/1476341_573477486053753_66970647_n.jpg",
      "sizes": {
        "thumbnail": {
          "file": "1476341_573477486053753_66970647_n-150x150.jpg",
          "width": 150,
          "height": 150,
          "mime-type": "image\/jpeg",
          "url": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-150x150.jpg"
        },
        "medium": {
          "file": "1476341_573477486053753_66970647_n-300x300.jpg",
          "width": 300,
          "height": 300,
          "mime-type": "image\/jpeg",
          "url": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-300x300.jpg"
        }
      },
      "image_meta": {
        "aperture": 0,
        "credit": "",
        "camera": "",
        "caption": "",
        "created_timestamp": 0,
        "copyright": "",
        "focal_length": 0,
        "iso": 0,
        "shutter_speed": 0,
        "title": "",
        "orientation": 0
      }
    }
  },
  "terms": {
    "place-category": [{
      "ID": 7,
      "name": "Lazer",
      "slug": "lazer",
      "description": "Cinemas, teatros, galerias, pra\u00e7as, quadras, parques, clubes e tal",
      "taxonomy": "place-category",
      "parent": null,
      "count": 4,
      "link": "http:\/\/www.bikeit.com.br\/place\/categories\/lazer\/",
      "meta": {
        "links": {
          "collection": "http:\/\/www.bikeit.com.br\/api\/taxonomies\/place-category\/terms",
          "self": "http:\/\/www.bikeit.com.br\/api\/taxonomies\/place-category\/terms\/7"
        }
      },
      "markers": {
        "default": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/30_lazer1.png",
        "approved": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/30_lazer3.png",
        "failed": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/30_lazer2.png",
        "stamp": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/30_lazer4.png",
        "position": "center"
      }
    }]
  }
}]
```

## Single place

**`GET api/posts/:placeId`**

## Response

Place object

## Reviews

**`GET api/posts?type=review`**

### Parameters

- `filters` [see all the acceptable filters here](http://wp-api.org/#posts_retrieve-posts_input)

### Response

Array of review objects

```json
[{
  "ID": 175,
  "title": "CineSesc, por Luiza Peixe",
  "status": "publish",
  "type": "review",
  "author": {
    "ID": 4,
    "username": "peixe.luiza@gmail.com",
    "name": "Luiza Peixe",
    "first_name": "Luiza Peixe",
    "last_name": "",
    "nickname": "Luiza Peixe",
    "slug": "peixe-luizagmail-com",
    "URL": "",
    "avatar": "http:\/\/0.gravatar.com\/avatar\/cf820d4bc34101e78d33f5d7243ff246?s=96",
    "description": "",
    "registered": "2015-08-26T17:41:08+00:00",
    "meta": {
      "links": {
        "self": "http:\/\/www.bikeit.com.br\/api\/users\/4",
        "archives": "http:\/\/www.bikeit.com.br\/api\/users\/4\/posts"
      }
    },
    "votes": {
      "up": 3,
      "down": 0
    },
    "total_reviews": "4"
  },
  "content": "<p>O CineSesc e o BikeIT t\u00eam uma antiga hist\u00f3ria de amor e \u00f3dio <3\n\nMas o importante \u00e9 que hoje eles oferecem aos ciclistas um paraciclo no estilo &#8220;gancho de carne&#8221; ao lado de fora do cinema. Na barra de metal inferior \u00e9 poss\u00edvel prender o quadro da bike, coisa que muitos paraciclos nesse estilo nunca se ligaram em fazer hehehe.\n<\/p>\n",
  "link": "http:\/\/www.bikeit.com.br\/#!\/places\/173\/r\/175",
  "date": "2015-08-26T22:07:41",
  "modified": "2015-11-08T21:56:26",
  "format": "standard",
  "slug": "175",
  "comment_status": "open",
  "ping_status": "closed",
  "sticky": false,
  "date_tz": "Etc\/GMT-3",
  "date_gmt": "2015-08-26T22:07:41",
  "modified_tz": "Etc\/GMT-3",
  "modified_gmt": "2015-11-08T21:56:26",
  "meta": {
    "links": {
      "self": "http:\/\/www.bikeit.com.br\/api\/posts\/175",
      "author": "http:\/\/www.bikeit.com.br\/api\/users\/4",
      "collection": "http:\/\/www.bikeit.com.br\/api\/posts",
      "replies": "http:\/\/www.bikeit.com.br\/api\/posts\/175\/comments",
      "version-history": "http:\/\/www.bikeit.com.br\/api\/posts\/175\/revisions"
    }
  },
  "place": "173",
  "rating": {
    "approved": 0,
    "structure": 4,
    "kindness": 3,
    "stampable": 0
  },
  "votes": {
    "up": 1,
    "down": 0,
    "total": 1,
    "ratio": 1
  },
  "images": [{
    "ID": 174,
    "name": "1476341_573477486053753_66970647_n",
    "source": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n.jpg",
    "attachment_meta": {
      "width": 640,
      "height": 640,
      "file": "2015\/08\/1476341_573477486053753_66970647_n.jpg",
      "sizes": {
        "thumbnail": {
          "file": "1476341_573477486053753_66970647_n-150x150.jpg",
          "width": 150,
          "height": 150,
          "mime-type": "image\/jpeg",
          "url": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-150x150.jpg"
        },
        "medium": {
          "file": "1476341_573477486053753_66970647_n-300x300.jpg",
          "width": 300,
          "height": 300,
          "mime-type": "image\/jpeg",
          "url": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-300x300.jpg"
        }
      },
      "image_meta": {
        "aperture": 0,
        "credit": "",
        "camera": "",
        "caption": "",
        "created_timestamp": 0,
        "copyright": "",
        "focal_length": 0,
        "iso": 0,
        "shutter_speed": 0,
        "title": "",
        "orientation": 0
      }
    },
    "thumb": "http:\/\/www.bikeit.com.br\/wp-content\/uploads\/2015\/08\/1476341_573477486053753_66970647_n-150x150.jpg"
  }],
  "terms": []
}]
```

## Place reviews

**`GET /api/posts?type=review`**

### Parameters

- `filters` [see all the acceptable filters here](http://wp-api.org/#posts_retrieve-posts_input)
  - `place_reviews`: place ID *(int)*

### Response

Array of review objects

## User reviews

**`GET /api/posts?type=review`**

### Parameters

- `filters` [see all the acceptable filters here](http://wp-api.org/#posts_retrieve-posts_input)
  - `author`: user ID *(int)*

### Response

Array of review objects

## Single review

**`GET /api/posts/:reviewId`**

### Response

Review object

## Review comments

**`GET /api/posts/:reviewId/comments`**

### Response

Array of comment object

```json
[{
  "ID": 9,
  "post": 510,
  "content": "<p>This is a comment<\/p>\n",
  "status": "approved",
  "type": "comment",
  "parent": 0,
  "author": {
    "ID": 1,
    "username": "miguelpeixe",
    "name": "Miguel Peixe",
    "first_name": "Miguel",
    "last_name": "Peixe",
    "nickname": "miguelpeixe",
    "slug": "miguelpeixe",
    "URL": "",
    "avatar": "http:\/\/0.gravatar.com\/avatar\/02511f339863e0d2e6c0c6b16a4e2f13?s=96",
    "description": "",
    "registered": "2015-02-04T13:46:22+00:00",
    "meta": {
      "links": {
        "self": "http:\/\/wwww.bikeit.com.br\/api\/users\/1",
        "archives": "http:\/\/www.bikeit.com.br\/api\/users\/1\/posts"
      }
    },
    "votes": {
      "up": 17,
      "down": 0
    },
    "total_reviews": "10"
  },
  "date": "2015-11-16T20:38:21",
  "date_tz": "Etc\/GMT-3",
  "date_gmt": "2015-11-16T23:38:21",
  "meta": {
    "links": {
      "up": "http:\/\/www.bikeit.com.br\/api\/posts\/510",
      "self": "http:\/\/www.bikeit.miguel.peixe\/api\/posts\/510\/comments\/9"
    }
  }
}]
```

## Publishing content

### Place

[Authorization required](http://wp-api.org/guides/authentication.html)

**`POST /api/posts`**

```json
{
  "type": "place",
  "status": "publish",
  "title": "string (required)",
  "content_raw": "string (required)",
  "place_meta": {
    "category": "int - category ID (required)",
    "address": "string (required)",
    "lat": "float (required)",
    "lon": "float (required)",
    "road": "string (required)",
    "district": "string (required)",
    "number": "string (required)",
    "osm_id": "int",
    "params": "string (stringified nominatim json data if available)"
  }
}
```

### Review

[Authorization required](http://wp-api.org/guides/authentication.html)

**`POST /api/posts`**

```json
{
  "type": "review",
  "status": "publish",
  "title": "string (required)",
  "content_raw": "string (required)",
  "images": "[array of int (media IDs)]",
  "review_meta": {
    "approved": "boolean (required)",
    "kindness": "int - 1 to 5 (required)",
    "structure": "int - 1 to 5 (required)",
    "stampable": "boolean",
    "place": "int - place ID (required)"
  }
}
```

### Media

[Authorization required](http://wp-api.org/guides/authentication.html)

**`POST /api/media`**

Follow the steps on the [WP REST API documentation](http://wp-api.org/#media_create-an-attachment).
