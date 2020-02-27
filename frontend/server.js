var request = new Request('localhost:8000/cluster', {
  method: 'POST',
  body: {
  	"datetime_interval_start": "2017/01/01",
  	"datetime_interval_end": "2017/02/01",
  	"depth": 1,
  	"selected_subreddits": [3]
  }
});