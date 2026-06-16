export default defineAppConfig({
  pages: [
    'pages/find/index',
    'pages/merchant/index',
    'pages/quote/index',
    'pages/order/index',
    'pages/mine/index',
    'pages/search/index',
    'pages/part-detail/index',
    'pages/merchant-detail/index',
    'pages/quote-compare/index',
    'pages/order-detail/index',
    'pages/dispute/index',
    'pages/car-identify/index',
    'pages/photo-identify/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1A6DFF',
    navigationBarTitleText: '拆车找件',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1A6DFF',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/find/index',
        text: '找件'
      },
      {
        pagePath: 'pages/merchant/index',
        text: '商家'
      },
      {
        pagePath: 'pages/quote/index',
        text: '报价'
      },
      {
        pagePath: 'pages/order/index',
        text: '订单'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
