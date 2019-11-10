pragma solidity ^0.5.0;

contract Weibo{
    
    //No time stamp needed, hope we can get this from the blockchain information
    struct userInfo{
        address user;
        uint[] weiboIndexes;
        mapping(uint=>uint) commentIndexes;
    }
    
    struct likes{
        uint likesNumber;
        uint likePrice;
    }
   
    struct comments{
        uint commentsNumber;
        uint weiboIndex;
        address[] authors;
        string[] contents;
    }
    
    struct weibo{
        uint sourceIndex;
        uint index;
        address author;
        string tags;
        string content;
        likes thumbUps;
        comments weiboComments;
        uint[] citedIndexes;
        
    }
    
    mapping(address=>userInfo)  users;
    
    uint  public weiboCount=0;

    weibo[]  weibos;

    //  mapping(address => string [] ) public notes;

    // address[16] public adopters;  // 保存领养者的地址

    // //mapping(uint=>weibo)  weiboMap;
    
    function publishNewWeibo(string memory content,string memory tags,uint likePrice)public payable{
        likes memory newLikes = likes({likesNumber:0,likePrice:likePrice});
        address[] memory authors;
        string[] memory contents;
        comments memory newComments = comments({weiboIndex:weiboCount,commentsNumber:0,authors:authors,contents:contents});
        uint[] memory newCitedIndex;
        weibos.push(weibo({sourceIndex:0,index:weiboCount,author:msg.sender,tags:tags,content:content,thumbUps:newLikes,weiboComments:newComments,citedIndexes:newCitedIndex}));
        //weiboMap[weiboCount]= weibo({sourceIndex:0,index:weiboCount,author:msg.sender,tags:tags,content:content,thumbUps:newLikes,citedIndexes:newCitedIndex});
        users[msg.sender].weiboIndexes.push(weiboCount);
         weiboCount++;
         address(block.coinbase).transfer(1 finney);
        // if(users[msg.sender].user != address(0)){
        //     users[msg.sender].weiboIndexes.push(weiboCount);
        // }
        // else{
        //     uint[] storage newWeiboIndex=new uint[]();
        //     newWeiboIndex.push(weiboCount);
        //     users[msg.sender] = userInfo({user:msg.sender,weiboIndexes:newWeiboIndex});
        // }
    }

    function getWeiboCount() public view returns(uint){
        return weiboCount;
    }

    function getWeiboContent(uint i)public view returns(string memory){
        return weibos[i].content;
    }

    function getWeiboTags(uint i)public view returns(string memory){
        return weibos[i].tags;
    }

    function getWeiboAuthor(uint i)public view returns(address){
        return weibos[i].author;
    }
    
    function getWeiboSourceIndex(uint i)public view returns(uint){
        return weibos[i].sourceIndex;
    }
    
    function getWeiboIndex(uint i)public view returns(uint){
        return weibos[i].index;
    }
    
    function getWeiboLikesNumber(uint i)public view returns(uint){
        return weibos[i].thumbUps.likesNumber;
    }
    
     function getWeiboCitedNumber(uint i)public view returns(uint){
        return weibos[i].citedIndexes.length;
    }

    function getWeiboCommentsNumber(uint i)public view returns(uint){
        return weibos[i].weiboComments.commentsNumber;
    }
    
    function getCommentAuthor(uint weiboIndex,uint CommentIndex)public view returns(address){
        return weibos[weiboIndex].weiboComments.authors[CommentIndex];
    }
    
    function getCommentContent(uint weiboIndex,uint CommentIndex)public view returns(string memory){
        return weibos[weiboIndex].weiboComments.contents[CommentIndex];
    }
    
    function publishNewComment(uint weiboIndex,string memory content)public payable{
        weibos[weiboIndex].weiboComments.authors.push(msg.sender);
        weibos[weiboIndex].weiboComments.contents.push(content);
        weibos[weiboIndex].weiboComments.commentsNumber++;
        address(block.coinbase).transfer(0.05 finney);
        users[msg.sender].commentIndexes[weiboIndex]=weibos[weiboIndex].weiboComments.contents.length;
    }
    
    function giveALike(uint i)public payable{
        require(msg.sender!=weibos[i].author);
        address payable payableAuthor = address(uint160(weibos[i].author));
        payableAuthor.transfer(weibos[i].thumbUps.likePrice);
        weibos[i].thumbUps.likesNumber++;
    }
    
    function citeAWeibo(uint i)public payable{
        require(msg.sender!=weibos[i].author);
        likes memory newLikes = likes({likesNumber:0,likePrice:30000});
        address[] memory authors;
        string[] memory contents;
        comments memory newComments = comments({weiboIndex:weiboCount,commentsNumber:0,authors:authors,contents:contents});
        uint[] memory newCitedIndex;
        weibos.push(weibo({sourceIndex:i+1,index:weiboCount,author:msg.sender,tags:weibos[i].tags,content:weibos[i].content,thumbUps:newLikes,weiboComments:newComments,citedIndexes:newCitedIndex}));
        //weiboMap[weiboCount]= weibo({sourceIndex:0,index:weiboCount,author:msg.sender,tags:tags,content:content,thumbUps:newLikes,citedIndexes:newCitedIndex});
        weibos[i].citedIndexes.push(weiboCount);
        users[msg.sender].weiboIndexes.push(weiboCount);
        address(block.coinbase).transfer(0.1 finney);
         weiboCount++;
    }
    
    
    
    
    
    
    
    
    
}