<template>
    <div class="searchChannel">
        <div class="top">
            <div class="title">搜索频道</div>
            <div class="close" @click="close()"></div>
        </div>
        <div class="main">
            <div class="searchInput">
                <input type="text" placeholder="输入频道名" v-model.lazy="searchContent">
                <div class="searchBtn" @click="searchMethod()"></div>
            </div>
            <div v-if="searchFlag">
                <div>
                    <div class="tip">未加入</div>
                    <ul>      
                        <li class="showInfLi" v-for="(item,index) in outofChannelList">
                            <div class="infmain">
                                <div class="avatar" :style="{backgroundImage:'url('+ item.Cavatar +')'}"></div>
                                <span class="cname">{{ item.Cname }}</span>
                                <div class="option">
                                    <div class="add" @click="addChannel(item)"></div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div>
                    <div class="tip">已加入</div>
                    <ul>      
                        <li class="showInfLi" v-for="(item,index) in inChannelList">
                            <div class="infmain">
                                <div class="avatar" :style="{backgroundImage:'url('+ item.Cavatar +')'}"></div>
                                <span class="cname">{{ item.Cname }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="noRes" v-else>
                <div style="height:10px"></div>
                <div class="text" v-if="textShow">暂无搜索内容</div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useUserCounterStore } from '../../stores/userCounter';
    import { useChannelCounterStore } from '../../stores/channelCounter';
    import { watch, toRaw, provide, ref, inject } from 'vue';
    import axios from 'axios';
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const userInfo = useUserCounterStore().userInfo
    const channelCounter = useChannelCounterStore()

    const flag = inject('flag')
    const searchchannelFlag = inject('searchchannelFlag')

    const searchContent = ref('')
    const searchFlag = ref(false)
    const textShow = ref(false)

    let inChannelList = ref([])
    let outofChannelList = ref([])
    let CidList = []
    for(const index in channelCounter.channelList){
        CidList.push(channelCounter.channelList[index].Cid)
    }

    // 频道模糊查询
    const searchMethod = async() => {
        searchFlag.value = false
        textShow.value = false
        inChannelList.value = []
        outofChannelList.value = []
        const query = {
            Cname:searchContent.value
        }
        await axios.get('http://localhost:3000/api/userApi/queryChannelByCname',{
            params:query
        }).then(resp => {
            
            const result = resp.data
            if(result.length > 0){
                searchFlag.value = true
                for(const index in result){
                    result[index].Cavatar = result[index].Cavatar.replace("D:\\VScode\\workspace\\study\\server\\public","http://127.0.0.1:3000")
                    result[index].Cavatar = result[index].Cavatar.replaceAll('\\','//')
                    if(CidList.indexOf(result[index].Cid) == -1){
                        outofChannelList.value.push(result[index])
                    }else{
                        inChannelList.value.push(result[index])
                    }
                }
            }else{
                textShow.value = true
            }
        }).catch(err => {
            console.error(err);
        })
    }

    // 加入频道
    const addChannel = async(item) => {
        const f = confirm('确定加入' + item.Cname +'频道吗')
        if(f){
            await axios.post('http://localhost:3000/api/userApi/addUserinChannel',{
                Cid:item.Cid,
                Uid:userInfo.Uid,
                ifmanager:0
            }).then(resp => {
                alert('成功加入' + item.Cname +'频道')
                close()
                router.go(0)
            }).catch(err => {
                console.error(err);
            })
        }
    }
    // 关闭遮罩层
    const close = () => {
        flag.value = false
        searchchannelFlag.value = false
    }

</script>

<style scoped>
.searchChannel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 600px;
    height: 500px;
    overflow: hidden;
    border-radius: 10px;
    background-color: rgb(220, 220, 220);
    overflow: scroll;
}
.searchChannel::-webkit-scrollbar{
    display: none;
}
.top {
    height: 50px;
    margin: 10px;
    display: flex;
    justify-content: space-between
}

.title {
    line-height: 50px;
    font-size:22px;
    font-weight: bold;
}

.close {
    margin-top: 15px;
    width: 20px;
    height: 20px;
    background-image: url('/icon/close.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.main{
    margin: 5px 20px;
}
.searchInput{
    width:320px;
    margin:0 auto;
    padding:0 10px;
    border-radius: 5px;
    background-color: #fff;
    display: flex;
}
.searchInput input{
    height: 30px;
    width: 300px;
    padding: 0;
    border: 0;
}
.searchBtn{
    margin:5px 0;
    height:20px;
    width:20px;
    background-image: url('/icon/search.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    cursor: pointer;
}
.tip{
    margin:5px 0;
}
.showInfLi{
    height:50px;
    padding:5px 10px;
    margin-bottom:20px;
    border-radius: 10px;
    background-color: rgb(212, 212, 212);
}
.showInfLi:hover{
    background-color:rgb(203, 203, 203)
}
.infmain{
    height:50px;
    line-height: 50px;
    border-radius: 10px;
}
.avatar{
    width:50px;
    height:50px;
    border-radius: 50px;
    float:left;
    background-color: white;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.cname{
    float:left;
    height:50px;
    margin-left:20px;
    font-weight: bold;
}
.option{
    float:right;
    height:50px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.add{
    width:20px;
    height:20px;
    margin:15px 10px 0 0;
    background-image: url('/icon/add_grey.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    cursor: pointer;
}
.noRes{
    margin:0 auto;
    width:500px;
    height:400px;
    background-image: url('/icon/暂无搜索内容.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.text{
    margin-top:20px;
    text-align: center;
    font-size:20px;
    font-weight: bold;

}
</style>