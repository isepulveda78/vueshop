Vue.component('products', {
    template: "#cart"
});
Vue.component('paypal-checkout');
new Vue({
    el: '#app',
    data: {
        total: 0,
        products: [],
        cart: [],
        search: '',
        loading: false,
        page: 1,
        perPage: 9,
        pages: [],
        spk:"pk_test_pQ5gIie4jjDpJ9kga446Gp5s",
        stripe:undefined,
        card:undefined,
        msg: 'Pay Here',
        lockSubmit:false,
        api:"http://127.0.0.1:5500/"
    },
    computed: {
        filterProducts: function(){
            return this.products.filter((product) => {
                return product.name.toLowerCase().includes(this.search.toLowerCase())
            })
        },
        displayedProducts () {
			return this.paginate(this.filterProducts);
		}
    },
    methods: {
        addToCart: function(product) {
            this.total += parseInt(product.price);
			var found = false;
			for (var i = 0; i < this.cart.length; i++) {
				if (this.cart[i].id === product.id) {
					this.cart[i].qty++;
					found = true;
				}
			}
			if (!found) {
				this.cart.push({
					id: product.id,
					name: product.name,
					price: product.price,
					qty: 1
				});
            }
        },
        clickCallback(pageNum) {
            console.log(pageNum);
        },
        setPages () {
			let numberOfPages = Math.ceil(this.products.length / this.perPage);
			for (let index = 1; index <= numberOfPages; index++) {
				this.pages.push(index);
			}
		},
		paginate (products) {
			let page = this.page;
			let perPage = this.perPage;
			let from = (page * perPage) - perPage;
			let to = (page * perPage);
			return  products.slice(from, to);
		},
        inc: function(item){
            item.qty++;
            this.total += parseInt(item.price);
        },
        dec: function(item){
            item.qty--;
            this.total -= parseInt(item.price);

            if(item.qty <= 0){
                var i = this.cart.indexOf(item);
                this.cart.splice(i, 1);
            }
        },
        onSubmit: function(){
          var path = "/search?q=".concat(this.search);
          this.$http.get(path)
          .then(function(response){
            this.products = data;
          });
        },
        getProducts(){
                this.loading = true;
                fetch('https://hplussport.com/api/products/order/price')
                /* Responding to a json file */
                .then(response => response.json())
                .then(data => {
                 /* The data from the json gets passed onto variable called products */
                    this.loading = false;
                    this.products = data;
                 });
        },
        purchase() {
            var self = this;
            self.lockSubmit=true
      
            self.stripe.createToken(self.cardNumber).then(function(result) {
              if (result.error) {
                alert(result.error.message)
                self.$forceUpdate(); // Forcing the DOM to update so the Stripe Element can update.
                self.lockSubmit=false
                return;
              }
              else{ 
                self.processTransaction(result.token.id)
              }
            })
            .catch((err) => {
              alert("error: "+err.message)
              self.lockSubmit=false
            });
          },
          processTransaction(transactionToken){
            var self=this;
            dt= {
                amount:self.stripCurrency(self.payAmount), //stripe uses an int [with shifted decimal place] so we must convert our payment amount
                currency:"USD",
                description:"something to say",
                token:transactionToken
            }
            var route=self.api+"/charge/card"
            self.$http.post(route,dt, {
                headers: {
                }
            }).then(response => {
                if(response.status==200){
                    alert("Transaction succeeded")
                    self.lockSubmit=false
                }
                else{
                    throw new Error("failed donation")
                }
            }).catch((err) => {
                alert("error: "+err.message)
                self.lockSubmit=false
            });
          }
    },
    filters: {
        currency: function(price){
            return '$' + Number.parseFloat(price).toFixed(2);
        },
    },
    watch: {
		products () {
			this.setPages();
		}
	},
    mounted() {
        this.getProducts();

       if(this.cart.length > 0){
        var self=this;
        self.stripe= Stripe(self.spk);
        self.card = self.stripe.elements().create('card');
        self.card.mount(self.$refs.card);
        self.cardNumber = elements.create('cardNumber', {style: style});
        self.cardNumber.mount(self.$refs.cardNumber);
        self.cardExpiry = elements.create('cardExpiry', {style: style});
        self.cardExpiry.mount(self.$refs.cardExpiry);
        self.cardCvc = elements.create('cardCvc', {style: style});
        self.cardCvc.mount(self.$refs.cardCvc);
       }
    }
})
