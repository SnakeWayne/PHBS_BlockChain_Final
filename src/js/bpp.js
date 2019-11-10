document.write('<script src="js/crypto-js/crypto-js.js" type="text/javascript" charset="utf-8"></script>');
App = {
  
  currentWeiboNumber:0,
  web3Provider: null,
  contracts: {},

  init: async function() {
    //Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#weibosRow');
    //   var petTemplate = $('#weiboTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });
    

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    // var crypto=window.crypto.subtle;
    // console.log(crypto)
    //const key = crypto.encrypt("password", 'salt', 24);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
  
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
  
      // Use our contract to retrieve and mark the adopted pets
      //return App.markAdopted();
    });

    $.getJSON('Weibo.json', function(data) {
      // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
      var WeiboArtifact = data;
      App.contracts.Weibo = TruffleContract(WeiboArtifact);
  
      // Set the provider for our contract
      App.contracts.Weibo.setProvider(App.web3Provider);
  
      // Use our contract to retrieve and mark the adopted pets
     
      return  App.markWeibos();
    });
    
    var ciphertext = window.CryptoJS.AES.encrypt('my message', 'secret key 123').toString();
    console.log(ciphertext);
    var deciphertext = window.CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
    var originalText = deciphertext.toString(CryptoJS.enc.Utf8);
    console.log(originalText);
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '#publishNewWeiboButton', App.handlePublish);
    $(document).on('click', '.forwardButton', App.handleForward);
    $(document).on('click', '.likeButton', App.handleLike);
    $(document).on('click', '.Comments', App.showComments);
    $(document).on('click', '#publishNewCommentButton', App.publishNewComments);
    $(document).on('click', '#decryptButton', App.decrypt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

  App.contracts.Adoption.deployed().then(function(instance) {
    adoptionInstance = instance;
    //console.log(adoptionInstance.getCount.call())
    // 调用合约的getAdopters(), 用call读取信息不用消耗gas
    
    return adoptionInstance.getCount.call();

  }).then(function(count) {
    
    console.log("adoption count is")
    var num = parseInt(count);
    console.log(num);
    $('.panel-pet').eq(0).find('button').text(num);
    // console.log("adoption count is")
    // console.log(adopters);
    // for (i = 0; i < adopters.length; i++) {
    //   console.log(adopters[i])
    //   if (adopters[i] !== '0x'&&adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //     console.log(i);
    //     $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //   }
    // }


  //   console.log(adoptionInstance)
  //   return adoptionInstance.getCount.call();
  // }).then(function(count) {
  //   console.log("adoption count is")
  //   console.log(count);
  // 
}).catch(function(err) {
    console.log(err.message);
  });
  },

  handlePublish: function(event) {
    event.preventDefault();
    console.log(event.target)
  var adoptionInstance;

  // 获取用户账号
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.Weibo.deployed().then(function(instance) {
      weiboInstance = instance;
      var  localWeibo = $('#new_weibo').val();
      var  localTags = $('#new_tags').val();
      // 发送交易领养宠物
      return weiboInstance.publishNewWeibo(localWeibo,localTags,5000, {from: account,value:1000000000000000});
    }).then(function(result) {
      console.log("hhhhhhhh");
      return App.showNewWeibo();
    }).catch(function(err) {
      console.log(err.message);
    });
  });
  },


  handleForward: function(event) {
    event.preventDefault();

     var weiboID = parseInt($(event.target).data('id'));
  var adoptionInstance;

  // 获取用户账号
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.Weibo.deployed().then(function(instance) {
      weiboInstance = instance;
      // 发送交易领养宠物
      return weiboInstance.citeAWeibo(weiboID-1,{from: account,value:100000000000000});
    }).then(function(result) {
      return weiboInstance.getWeiboCitedNumber.call(weiboID-1).then(function(citedNumber){
        $('.forwardButton').eq(App.currentWeiboNumber-weiboID).text(citedNumber+" Forward");
      })
      

    }).then(function(){
      console.log("is waiting")
      return App.showNewWeibo();
    })
    .catch(function(err) {
      console.log(err.message);
    });
  });
  },

  handleLike: function(event) {
    event.preventDefault();

     var weiboID = parseInt($(event.target).data('id'));
  var adoptionInstance;

  // 获取用户账号
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }
    var account = accounts[0];

    App.contracts.Weibo.deployed().then(function(instance) {
      weiboInstance = instance;
      // 发送交易领养宠物
      return weiboInstance.giveALike(weiboID-1,{from: account,value:100000000000000});
    }).then(function(result) {
      return weiboInstance.getWeiboLikesNumber.call(weiboID-1).then(function(likesNumber){

        $('.likeButton').eq(App.currentWeiboNumber-weiboID).text(likesNumber+" Likes");
      })
      

    })
    .catch(function(err) {
      console.log(err.message);
    });
  });
  },

  publishNewComments: function(event) {
    event.preventDefault();

     var weiboID = parseInt($(event.target).data('id'));
  var adoptionInstance;

  // 获取用户账号
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }
    var account = accounts[0];
    var comments = $("#new_comments").val()
    App.contracts.Weibo.deployed().then(function(instance) {
      weiboInstance = instance;
      // 发送交易领养宠物
      return weiboInstance.publishNewComment(weiboID-1,comments,{from: account,value:100000000000000});
    }).then(function(){
      var commentTemplate = $("<tr><td></td><td></td></tr>");
      commentTemplate.find("td").eq(0).text(account);
      commentTemplate.find("td").eq(1).text(comments);
      $("tbody").append(commentTemplate);
      return weiboInstance.getWeiboCommentsNumber.call(weiboID-1).then(function(commentNumber){

        $('.Comments').eq(App.currentWeiboNumber-weiboID).text(commentNumber+" Comments");
      })
    })
    .catch(function(err) {
      console.log(err.message);
    });
  });
  },

  decrypt:function(event){
    event.preventDefault();

     var weiboID = parseInt($(event.target).data('id'));
  var adoptionInstance;
    App.contracts.Weibo.deployed().then(function(instance) {
      weiboInstance = instance;

      // 发送交易领养宠物
      return weiboInstance.getWeiboContent.call(weiboID-1);
    }).then(function(encryptedText) {
      console.log(encryptedText)
      $("#encryptedText").val(encryptedText);
      $('#secretKey').val('');

    })
    .catch(function(err) {
      console.log(err.message);
    });
  },

  showComments:function(event){
    event.preventDefault();

     var weiboID = parseInt($(event.target).data('id'));
     $('#publishNewCommentButton').attr('data-id', weiboID);
  var adoptionInstance;
    App.contracts.Weibo.deployed().then(function(instance) {
      weiboInstance = instance;

      // 发送交易领养宠物
      return weiboInstance.getWeiboCommentsNumber.call(weiboID-1);
    }).then(function(commentsNumber) {
      console.log("current comment Number is"+commentsNumber)
      var number = parseInt(commentsNumber);
      console.log("current comment Number is"+number)
      $("tbody").empty();
      
      for(var i =0;i<number;i++){
        (function(i){
          var commentTemplate = $("<tr><td></td><td></td></tr>");
          weiboInstance.getCommentAuthor.call(weiboID-1,i).then(function(commentAuthor){
            commentTemplate.find("td").eq(0).text(commentAuthor);
          })

          weiboInstance.getCommentContent.call(weiboID-1,i).then(function(commentContent){
            commentTemplate.find("td").eq(1).text(commentContent);
          })
          $("tbody").append(commentTemplate);

        }
        )(i);
      }
      console.log(commentTemplate);
      
      

    })
    .catch(function(err) {
      console.log(err.message);
    });
  },

  showNewWeibo:function(event) {
    var petsRow = $('#weibosRow');
    var petTemplate = $('#weiboTemplate');
    petTemplate.find('#decryptButton').attr('data-id', App.currentWeiboNumber+1);
    petTemplate.find('.forwardButton').attr('data-id', App.currentWeiboNumber+1);
    petTemplate.find('.likeButton').attr('data-id', App.currentWeiboNumber+1);
    petTemplate.find('.Comments').attr('data-id', App.currentWeiboNumber+1);
    petsRow.prepend(petTemplate.html());

    $(function() {
      i = App.currentWeiboNumber;
      weiboInstance.getWeiboIndex.call(i).then(function(weiboIndex){
        var index = parseInt(weiboIndex);
        var insertPosition = 0;
        $('.panel-title').eq(insertPosition).text("NO."+(index+1));

        weiboInstance.getWeiboSourceIndex.call(index).then(function(sourceIndex){
          if(sourceIndex==0){
            $('.weibo-source').eq(insertPosition).text("Original");
          }
          else{
            $('.weibo-source').eq(insertPosition).text(sourceIndex);
          }
        })
        
         weiboInstance.getWeiboAuthor.call(index).then(function(author){
          $('.weibo-author').eq(insertPosition).text(author);
        })
        weiboInstance.getWeiboTags.call(index).then(function(tags){
          $('.weibo-tags').eq(insertPosition).text(tags);
        })

        weiboInstance.getWeiboContent.call(index).then(function(content){
          $('.weibo-content').eq(insertPosition).text(content);
        })

        weiboInstance.getWeiboCitedNumber.call(index).then(function(citedNumber){
          $('.forwardButton').eq(insertPosition).text(citedNumber+" Forward");
        })

        weiboInstance.getWeiboLikesNumber.call(index).then(function(likesNumber){
          $('.likeButton').eq(insertPosition).text(likesNumber+" Likes");
        })

        weiboInstance.getWeiboCommentsNumber.call(index).then(function(commentsNumber){
          $('.Comments').eq(insertPosition).text(commentsNumber+" Comments");
        })
        App.currentWeiboNumber= App.currentWeiboNumber+1;
      
      })
    
    })
  },

  getWeibos: function(adopters, account) {
    var weiboInstance;

  App.contracts.Weibo.deployed().then(function(instance) {
    weiboInstance = instance;
    console.log(weiboInstance)
    // 调用合约的getAdopters(), 用call读取信息不用消耗gas
    // return weiboInstance.getWeiboAuthor.call(5);
    return "asdaa";
  }).then(function(adopters) {
    console.log("inside weibo listing progress")
    
    $(function() {
      weiboInstance.getWeiboCount.call().then(function(count){
        console.log(count);
      })
    });

    
    $('.panel-pet').eq(0).find('.panel-title').text("adopters");
    // for (i = 0; i < weiboInstance.getWeiboCount.call(); i++) {
    //   console.log(weibos[i])
    //   // if (adopters[i] !== '0x'&&adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //   //   console.log(i)
    //   //   $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //   // }
    // }
    return "asdaa";
  }).then(function(adopters) {
    $('.panel-pet').eq(0).find('.pet-breed').text(adopters);
  }).then(function(adopters) {
    $('.panel-pet').eq(0).find('.pet-breed').text(adopters);
  })
  .catch(function(err) {
    console.log(err.message);
  });
  },

  handleAdopt: function(event) {
    event.preventDefault();

  var petId = parseInt($(event.target).data('id'));

  var adoptionInstance;

  // 获取用户账号
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      // 发送交易领养宠物
      return adoptionInstance.adopt(petId, {from: account});
    }).then(function(result) {
      return App.markAdopted();
    }).catch(function(err) {
      console.log(err.message);
    });
  });
  },
  markWeibos: function(adopters, account) {
    var weiboInstance;

  App.contracts.Weibo.deployed().then(function(instance) {
    weiboInstance = instance;
    // 调用合约的getAdopters(), 用call读取信息不用消耗gas
    
    return weiboInstance.getWeiboCount.call()

  }).then(function(count) {
    var num = parseInt(count);
    var petsRow = $('#weibosRow');
    var petTemplate = $('#weiboTemplate');
    App.currentWeiboNumber =num;
    for(var i=0;i<num;i++){
      petTemplate.find('#decryptButton').attr('data-id', num-i);
      petTemplate.find('.forwardButton').attr('data-id', num-i);
      petTemplate.find('.likeButton').attr('data-id', num-i);
      petTemplate.find('.Comments').attr('data-id', num-i);
      petsRow.append(petTemplate.html());

    }
    //weiboInstance
      $(function() {
        for(var i=0;i<num;i++){
          console.log(i);
        weiboInstance.getWeiboIndex.call(i).then(function(weiboIndex){
          var index = parseInt(weiboIndex);
          var insertPosition = num-index-1
          $('.panel-title').eq(insertPosition).text("NO."+(index+1));

          weiboInstance.getWeiboSourceIndex.call(index).then(function(sourceIndex){
            if(sourceIndex==0){
              $('.weibo-source').eq(insertPosition).text("Original");
            }
            else{
              $('.weibo-source').eq(insertPosition).text(sourceIndex);
            }
          })
          
           weiboInstance.getWeiboAuthor.call(index).then(function(author){
            $('.weibo-author').eq(insertPosition).text(author);
          })
          weiboInstance.getWeiboTags.call(index).then(function(tags){
            $('.weibo-tags').eq(insertPosition).text(tags);
          })

          weiboInstance.getWeiboContent.call(index).then(function(content){
            $('.weibo-content').eq(insertPosition).text(content);
          })

          weiboInstance.getWeiboCitedNumber.call(index).then(function(citedNumber){
            $('.forwardButton').eq(insertPosition).text(citedNumber+" Forward");
          })

          weiboInstance.getWeiboLikesNumber.call(index).then(function(likesNumber){
            $('.likeButton').eq(insertPosition).text(likesNumber+" Likes");
          })

          weiboInstance.getWeiboCommentsNumber.call(index).then(function(commentsNumber){
            $('.Comments').eq(insertPosition).text(commentsNumber+" Comments");
          })
        
        })
      }
      });
    // console.log("adoption count is")
    // console.log(adopters);
    // for (i = 0; i < adopters.length; i++) {
    //   console.log(adopters[i])
    //   if (adopters[i] !== '0x'&&adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //     console.log(i);
    //     $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //   }
    // }


  //   console.log(adoptionInstance)
  //   return adoptionInstance.getCount.call();
  // }).then(function(count) {
  //   console.log("adoption count is")
  //   console.log(count);
  // 
}).catch(function(err) {
    console.log(err.message);
  });
  },

};



$(function() {
  $(window).load(function() {
    App.init();
  });
});
