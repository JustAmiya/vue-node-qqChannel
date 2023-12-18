import { createRouter, createWebHistory } from 'vue-router'
import login from '../components/login.vue'
import IndexPage from '../components/IndexPage.vue'
import notFound from '../components/notFound.vue'
import reginster from '../components/reginster.vue'
import leftNav from '../components/leftNav/leftNav.vue'
import rightContent from '../components/rightContent/rightContent.vue'
import whitePage from '../components/rightContent/rightContentMain/whitePage.vue'
import chat from '../components/rightContent/rightContentMain/chat.vue'
import post from '../components/rightContent/rightContentMain/post.vue'

//import jwt from 'jsonwebtoken'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      meta:{
        requireAuth:true
      },
      component:IndexPage,
      children:[{
          path:'channel/:id*',
          components:{
            default:leftNav,
            rightContent:rightContent
          },
          children:[
            {
              path:'whitePage',
              name:'whitePage',
              component:whitePage
            },
            {
              path:'chatroom/:cname',
              name:'chatroom',
              component:chat
            },
            {
              path:'postroom/:prname',
              name:'postroom',
              component:post
            },
            {
              path:'',
              redirect:'/404'
            }
          ]
      }
    ]
    },
    {
      path:'/login',
      name:'login',
      component:login,
      meta:{
        requireAuth:false
      }
    },
    {
      path:'/reginster',
      name:'reginster',
      component:reginster,
      meta:{
        requireAuth:false
      }
    },
    {
      path:'/404',
      component:notFound
    },
    {
      path:'/:catchAll(.*)',
      redirect:'/404'
    }
  ]
})

//路由守卫，判断有无token
router.beforeEach((to,from,next)=>{
  const token = sessionStorage.getItem('token')
  if(to.path === '/login' || to.path === '/reginster') return next()
  else{
    if(!token) return next('/login')
  }
  if(!token && to.meta.requireAuth) next('/login')
  else next()
})

export default router
