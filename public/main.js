document.getElementById('button').addEventListener('click', function(){
  const title = document.getElementById('movieTitle').value;
  const year = document.getElementById('movieYear').value;
  const genre = document.getElementById('movieGenre').value;
  const poster = document.getElementById('moviePoster').value;

  if(!title){
    alert('Enter a movie.');
    return;
  }

  fetch('/movies', {
    method: 'post', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({title, year, genre, poster})
  })
  .then(response => response.text())
  .then(data => {
    console.log(data);
    window.location.reload(true); //Used AI to help with reloading the profile to show the new movie so it pops up
  })
  .catch(err => console.log(err));
});


Array.from(document.getElementsByClassName('watched')).forEach(function(button) {
      button.addEventListener('click', function(){
        const movie = this.dataset.id;
        const watched = this.dataset.watched === 'true' ? false : true;
        fetch('movies/watched', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: movie,
            watched: watched
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(document.getElementsByClassName('rate')).forEach(function(button) {
  button.addEventListener('click', function(){
    const movie = this.dataset.id;
    const review = prompt('Enter your review:'); //Used ai to help with prompting users to enter a review and give a rating
    const rating = parseFloat(prompt('Give your rating (1-10):'));

    if (!rating) {
      alert('Enter a rating.');
      return;
    }
    fetch('movies/rate', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: movie,
        rating: rating,
        review: review
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

Array.from(document.getElementsByClassName('trash')).forEach(function(button) {
      button.addEventListener('click', function(){
        const movie = this.dataset.id;
        
        fetch('/movies', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: movie,
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
