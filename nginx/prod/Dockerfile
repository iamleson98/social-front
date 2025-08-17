# nginx.Dockerfile
FROM leminhson/nginx-brotli:1.29

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY brotli.conf /etc/nginx/conf.d/brotli.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
