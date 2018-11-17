import React,{Component} from 'react'
import $ from 'jquery'
const {log} = console
class App extends Component{


  constructor(){
    super()
    this.state ={
      userdata:[],
      photodata:[]
      ,isUser:false,
      Nophoto:false
    }
    this.handleform = this.handleform.bind(this)
  }
  handleform(e){
    e.preventDefault()
   log(e)

  }

  componentDidMount(){

    fetch(`http://localhost:9000/auth/ext/user/${usernameFormServer}`).then(res=>res.json()).then(data=>{
  let arr = [data]
      this.setState({userdata:arr,isUser:true
      })
    })

    fetch(`http://localhost:9000/auth/ext/photo/${usernameFormServer}`).then(res=>res.json()).then(photo=>{
    if(photo.hasOwnProperty('error'))

{
  this.setState({Nophoto:true})

}
      let arr = [photo]



 window.nophoto =false
      this.setState({photodata:arr,isUser:true})


      console.log(this.state.photodata)
    })




  }
  render(){
    return(<div className='container' id='container'>

<PageTitle/>
  <ErrorMsg/>
<div className='jumbotron' id='grid'>

   { this.state.Nophoto==false? this.state.photodata.map((result) =><Photo key={result._id} data={result.photoPath}/>):null}

   <br/>
   {this.state.isUser===true? this.state.userdata.map((results)=><Results key={results._id} user={results}/>):null}
   <br/>
   <Uploadfile handleme={this.handleform} photoStatus={this.state.Nophoto}/>





     </div>
     </div>  )
  }
}

class Photo extends Component{
  render(){
    return(<div id='profile-photo'>
  <img   id ='myphoto' src={this.props.data} alt='profile-photo' width='200'></img>

      </div>)
  }
}
class Results extends Component{
render(){
return (<div id='Results'  className='text-right'>
<ul className='form-group' >

<li name='id'> ID:{ this.props.user._id}</li>


<li name='name'> Name: {this.props.user.name}</li>


<li name='email'>Email:{this.props.user.username}</li>







</ul>





  </div>)

}

}
function PageTitle(){
  return(<div className=' alert alert-info'><h3 className='text-center'> MY PROFILE </h3> </div>)
}
class Uploadfile extends Component{
render(){
  return(
    <div>
{this.props.photoStatus==true?
    <button  class='btn-default' id='but' > uploadimage</button>:null
}
<div class="container" id='forms'>
  { this.props.photoStatus==true?
           <form action="/uploads" method="post" enctype="multipart/form-data" id="myform" class='form-upload form-group'>
       <input type='file' name='avatar' id='file' onSubmit={this.props.handleme}/>
       <input type='submit'  value='submit'  />


       </form>:
       null
         }
           <br/>
{this.props.photoStatus!=true?


<form  action='/updatephoto' method='post' enctype='multipart/form-data' id='changeinfo' class='text-right'  >
<input type='file' name='avatar' onSubmit={this.props.handleme}/>
<input type='submit' value='upload'  />

</form>:null
}           </div>
</div>
  )
}
}
function ErrorMsg(){


  if(error_msg.length>0){
    return(<div className='text-center alert alert-danger'>
  <h4 >{error_msg.map(v=>{
      return v
    })} </h4>

  </div>)


}
else{
  return(<div></div>)
}

}

export default App;
