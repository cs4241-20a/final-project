from requests import get
from bs4 import BeautifulSoup
from io import BytesIO
from PIL import Image


def make_request(url):
    headers = {'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'}
    try:
        res = get(url, headers=headers)
    except Exception as e:
        print('Could not connect:{}'.format(e))
    else:
        return res


def make_soup(response):
    try:
        soup = BeautifulSoup(response.content, 'lxml')
    except Exception as e:
        print('Could not make soup:{}'.format(e))
    else:
        return soup


def get_all_flag_links(soup):
    flag_urls = []
    for link in soup.findAll('img'):
        src = link.get('src')
        if isinstance(src, str) and src.endswith('.png'):
            flag_urls.append(src)
    return flag_urls


def download_image(img_links):
    count = 0
    for link in img_links:
        response = make_request('https:{}'.format(link))
        img = Image.open(BytesIO(response.content))
        img.save('flags/{}'.format(count) + '.png')
        count += 1


def main():
    wiki_url = 'https://en.wikipedia.org/wiki/Gallery_of_sovereign_state_flags'

    response = make_request(wiki_url)

    soup = make_soup(response)

    img_links = get_all_flag_links(soup)

    download_image(img_links)


if __name__ == '__main__':
    main()
