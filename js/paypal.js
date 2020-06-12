     //Displays PayPal buttons
     paypal.Buttons({
        commit: false,
           createOrder: function(data, actions) {
            // This function sets up the details of the transaction, including the amount and line item details
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: '2'
                }
              }]
            });
          },
          onCancel: function (data) {
              // Show a cancel page, or return to cart
           },
          onApprove: function(data, actions) {
            // This function captures the funds from the transaction
            return actions.order.capture().then(function(details) {
              // This function shows a transaction success message to your buyer
              alert('Thanks for your purchase!');
            });
          }
      }).render('#paypal-button-container');
      // Eligibility check for advanced credit and debit card payments
      if (paypal.HostedFields.isEligible()) {
        paypal.HostedFields.render({
          createOrder: function () {return "order-ID";}, // replace order-ID with the order ID
          styles: {
            'input': {
              'font-size': '17px',
              'font-family': 'helvetica, tahoma, calibri, sans-serif',
              'color': '#3a3a3a'
            },
            ':focus': {
              'color': 'black'
            }
          },
          fields: {
            number: {
              selector: '#card-number',
              placeholder: 'card number'
            },
            cvv: {
              selector: '#cvv',
              placeholder: 'card security number'
            },
            expirationDate: {
              selector: '#expiration-date',
              placeholder: 'mm/yy'
            }
          }
        }).then(function (hf) {
          $('#my-sample-form').submit(function (event) {
            event.preventDefault();
            hf.submit({
              // Cardholder Name
              cardholderName: document.getElementById('card-holder-name').value,
              // Billing Address
              billingAddress: {
                streetAddress: document.getElementById('card-billing-address-street').value,      // address_line_1 - street
                extendedAddress: document.getElementById('card-billing-address-unit').value,       // address_line_2 - unit
                region: document.getElementById('card-billing-address-state').value,           // admin_area_1 - state
                locality: document.getElementById('card-billing-address-city').value,          // admin_area_2 - town / city
                postalCode: document.getElementById('card-billing-address-zip').value,           // postal_code - postal_code
                countryCodeAlpha2: document.getElementById('card-billing-address-country').value   // country_code - country
              }
            });
          });
        });
      }
      else {
        $('#my-sample-form').hide();  // hides the advanced credit and debit card payments fields if merchant isn't eligible
      }