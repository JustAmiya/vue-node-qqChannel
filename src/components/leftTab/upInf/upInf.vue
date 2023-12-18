 <template>
    <div class="upInf">
        <div class="logo">
            <span>channel</span>
        </div>
        <div class="userIco">
            <img :src=info.Uavatar @click="changeUserInf(flag)">
        </div>
        <div class="search" @click="searchBtn(flag)"></div>
        <hr>
    </div>
    
</template>

<script setup>
    import {ref,inject,toRaw} from 'vue'
    import { useUserCounterStore } from '../../../stores/userCounter';
    const userCounter = useUserCounterStore()
    const info = toRaw(userCounter.userInfo)

    const flag = inject('flag')
    const changeuInfFlag = inject('changeuInfFlag')
    const searchchannelFlag = inject('searchchannelFlag')

    // 修改个人信息
    const changeUserInf = (f)=>{
        flag.value = !f
        changeuInfFlag.value = true
    }
    // 搜索频道
    const searchBtn = (f) => {
        flag.value = !f
        searchchannelFlag.value = true
    }
</script>

<style scoped>
.upInf{
    width:68px;
    height:150px;
}
.upInf .logo{
    width:100%;
    height:40px;
}
.upInf .logo span{
    width:100%;
    text-align: center;
    float:left;
    margin:9.6px 0;
}
.upInf .userIco{
    width:100%;
    height:50px;
}
.upInf .userIco img{
    height:40px;
    width:40px;
    border-radius: 100%;
    margin:5px 14px;
    object-position: 50% 50%;
    object-fit: contain;
    transition: 0.2s;
}
.upInf .userIco img:hover{
    transform:scale(1.05);
    box-shadow: 0 0 10px grey;
}
.search{
    width:30px;
    height:30px;
    margin:10px 19px;
    border-radius: 30px;
    background-image: url('/icon/search.svg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    cursor: pointer;
}
.upInf hr{
    width:40px;
    margin-bottom: 0;
}
</style>