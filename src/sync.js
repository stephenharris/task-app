import { Pantry } from 'pantry-cloud';

const pantry = new Pantry('2a34e36d-cf5c-4215-a030-771290ec6f7c');



pantry.getBasket('newBasket87')
      .then((result) => {
        console.log(result);
      })
      