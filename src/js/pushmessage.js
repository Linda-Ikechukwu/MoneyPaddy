//Utility function to convert vapid keys to the standard Unit8Array
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    ;
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

//display notification confirmation
const displayConfirmNotification = () => {
    const options = {
      body: 'You will now receive daily prompts to record your expenses',
      icon: '../icons/96.png',
      dir: 'ltr',
      lang: 'en-US', // BCP 47,
      vibrate: [100, 50, 200],
      badge: '../icons/96.png',
      tag: 'confirm-notification',
      renotify: true
    }
      
    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('Subscription Successful!', options);
    });
  
}

//Configuring subscriptions to push noifications
 export const configureSubscription = () => {
    let registration;
    navigator.serviceWorker.ready
      .then(swregistration => {
          registration = swregistration;
          return swregistration.pushManager.getSubscription();
      })
      .then(subscriptionList => {
          if (subscriptionList === null){
              var publicKey = 'BLdBmQJEKbyXDuvqA8b7IBXP7VhUCtqiRIibpdleNHiEaxNl_V-VLQbm-w2WghKEWiEMQsSwX4ssAt5pxEB9ZzU';
              var convertedPublicKey = urlBase64ToUint8Array(publicKey);
              //Create a new subscription
              return registration.pushManager.subscribe({
                     userVisibleOnly: true,
                     appilicationServerKeys: convertedPublicKey 
               });
            }else{
               //We have a subscription then
               console.log('subscription plan already exists');
            }
       })
       .then(newsubscription => {
            return fetch('https://money-paddy.firebaseio.com/subcriptions.json', {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'Accept': 'application/json' 
                },
                body: JSON.stringify(newsubscription)
            })
       }).catch(err => {
        console.log(err);
       })
       .then(response =>{
           if(response.ok){
              displayConfirmNotification();
           }
       })
       .catch(err => {
           console.log(err);
       });
}

