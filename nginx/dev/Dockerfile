FROM nginx:alpine

RUN rm /etc/nginx/conf.d/*

COPY ./nginx.conf /etc/nginx/conf.d/
COPY ./local.cert.pem /etc/letsencrypt/live/example.com/fullchain.pem
COPY ./local.key.pem /etc/letsencrypt/live/example.com/privkey.pem

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]