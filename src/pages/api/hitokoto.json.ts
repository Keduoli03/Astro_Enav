import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  try {
    const upstream = await fetch('https://v1.hitokoto.cn/?encode=json', {
      headers: { Accept: 'application/json' },
    })
    const data = await upstream.json()
    return new Response(
      JSON.stringify({ hitokoto: data.hitokoto, uuid: data.uuid }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch {
    return new Response(
      JSON.stringify({ hitokoto: '疏影横斜水清浅，暗香浮动月黄昏。', uuid: '' }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      }
    )
  }
}
