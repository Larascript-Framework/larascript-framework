# Extending Larascript Mail

This guide explains how to create custom mail drivers for Larascript Mail.

## Overview

Larascript Mail uses an adapter pattern that allows you to easily add new mail drivers. All drivers implement the `MailAdapter` interface and can optionally extend `BaseMailAdapter` for common functionality.

## Creating a Custom Driver

### 1. Basic Structure

Create a new driver class that implements the `MailAdapter` interface:

```typescript
import { MailAdapter } from '@ben-shepherd/larascript-mail';
import { Mail } from '@ben-shepherd/larascript-mail';

class CustomMailDriver implements MailAdapter {
  private options: any;

  constructor(options: any = {}) {
    this.options = options;
  }

  async send(mail: Mail): Promise<void> {
    // Your email sending logic here
    const { to, from, subject, body } = mail;
    
    // Example: Send email using your preferred service
    await this.sendEmail({
      to: mail.getTo(),
      from: mail.getFrom(),
      subject: mail.getSubject(),
      body: await this.generateBodyString(mail)
    });
  }

  getOptions<T>(): T {
    return this.options as T;
  }

  private async generateBodyString(mail: Mail): Promise<string> {
    const body = mail.getBody();
    
    if (typeof body === 'string') {
      return body;
    }
    
    // Handle template rendering if needed
    return JSON.stringify(body);
  }

  private async sendEmail(emailData: any): Promise<void> {
    // Implement your email sending logic
    console.log('Sending email:', emailData);
  }
}

export default CustomMailDriver;
```

### 2. Using BaseMailAdapter (Recommended)

For better integration with Larascript services, extend `BaseMailAdapter`:

```typescript
import BaseMailAdapter from '@ben-shepherd/larascript-mail/base/BaseMailAdapter';
import { MailAdapter } from '@ben-shepherd/larascript-mail';
import { Mail } from '@ben-shepherd/larascript-mail';

interface CustomMailOptions {
  apiKey: string;
  endpoint?: string;
}

class CustomMailDriver extends BaseMailAdapter implements MailAdapter {
  private options: CustomMailOptions;

  constructor(options: CustomMailOptions) {
    super();
    this.options = options;
  }

  async send(mail: Mail): Promise<void> {
    try {
      // Use the base class method for body generation
      const body = await this.generateBodyString(mail);
      
      // Send email using your service
      await this.sendViaCustomService({
        to: mail.getTo(),
        from: mail.getFrom(),
        subject: mail.getSubject(),
        html: body,
        apiKey: this.options.apiKey
      });
      
      this.logger.info('Email sent successfully', {
        to: mail.getTo(),
        subject: mail.getSubject()
      });
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  getOptions<T = CustomMailOptions>(): T {
    return this.options as T;
  }

  private async sendViaCustomService(emailData: any): Promise<void> {
    // Implement your email service API call
    const response = await fetch(this.options.endpoint || 'https://api.customservice.com/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
  }
}

export default CustomMailDriver;
```

### 3. Register Your Driver

Add your driver to the mail configuration:

```typescript
import { MailService, MailConfig } from '@ben-shepherd/larascript-mail';
import CustomMailDriver from './CustomMailDriver';

const mailConfig: MailConfig = {
  default: 'custom',
  drivers: [
    {
      name: 'custom',
      driver: CustomMailDriver,
      options: {
        apiKey: 'your-api-key',
        endpoint: 'https://api.customservice.com/send'
      }
    }
  ]
};

const mailService = new MailService(mailConfig, {});
```

## Email Templates with Larascript Views

Larascript Mail integrates seamlessly with Larascript Views to render email templates using EJS. This allows you to create dynamic, reusable email templates.

### Using EJS Templates

When extending `BaseMailAdapter`, you automatically get access to the view rendering service. You can use it to render EJS templates:

```typescript
// Create an email with a template
const mail = new Mail({
  to: 'user@example.com',
  from: 'noreply@yourapp.com',
  subject: 'Welcome to Our App!',
  body: {
    view: 'emails/welcome', // Path to your EJS template
    data: {
      userName: 'John Doe',
      activationLink: 'https://yourapp.com/activate/123',
      companyName: 'Your Company'
    }
  }
});

await mailService.send(mail);
```

### Creating EJS Email Templates

Create your email templates in your views directory (e.g., `views/emails/`):

```ejs
<!-- views/emails/welcome.ejs -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to <%= companyName %></title>
</head>
<body>
    <h1>Welcome, <%= userName %>!</h1>
    
    <p>Thank you for joining <%= companyName %>. We're excited to have you on board!</p>
    
    <p>To get started, please activate your account by clicking the link below:</p>
    
    <a href="<%= activationLink %>" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
        Activate Account
    </a>
    
    <p>If you have any questions, feel free to contact our support team.</p>
    
    <p>Best regards,<br>The <%= companyName %> Team</p>
</body>
</html>
```

### Template Data Structure

The `data` object passed to your templates can contain any information you need:

```typescript
// Complex template data
const mail = new Mail({
  to: 'user@example.com',
  from: 'noreply@yourapp.com',
  subject: 'Order Confirmation',
  body: {
    view: 'emails/order-confirmation',
    data: {
      order: {
        id: 'ORD-12345',
        total: 99.99,
        items: [
          { name: 'Product 1', price: 49.99 },
          { name: 'Product 2', price: 50.00 }
        ]
      },
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
      }
    }
  }
});
```

### Conditional Rendering in Templates

EJS templates support conditional rendering and loops:

```ejs
<!-- views/emails/order-confirmation.ejs -->
<h1>Order Confirmation</h1>
<p>Hello <%= user.name %>,</p>

<p>Thank you for your order! Here are your order details:</p>

<h2>Order #<%= order.id %></h2>

<table>
    <thead>
        <tr>
            <th>Item</th>
            <th>Price</th>
        </tr>
    </thead>
    <tbody>
        <% order.items.forEach(function(item) { %>
            <tr>
                <td><%= item.name %></td>
                <td>$<%= item.price.toFixed(2) %></td>
            </tr>
        <% }); %>
    </tbody>
</table>

<p><strong>Total: $<%= order.total.toFixed(2) %></strong></p>

<% if (shippingAddress) { %>
    <h3>Shipping Address:</h3>
    <p>
        <%= shippingAddress.street %><br>
        <%= shippingAddress.city %>, <%= shippingAddress.state %> <%= shippingAddress.zip %>
    </p>
<% } %>
```

### Template Inheritance

You can create reusable email layouts:

```ejs
<!-- views/emails/layouts/base.ejs -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><%= title %></title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><%= companyName %></h1>
        </div>
        
        <div class="content">
            <%- body %>
        </div>
        
        <div class="footer">
            <p>&copy; <%= new Date().getFullYear() %> <%= companyName %>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

```ejs
<!-- views/emails/welcome.ejs -->
<%- include('layouts/base', { title: 'Welcome!', companyName: 'Your Company' }) %>

<h2>Welcome, <%= userName %>!</h2>
<p>We're excited to have you join our community.</p>
```

## Interface Requirements

### MailAdapter Interface

Your driver must implement these methods:

```typescript
interface MailAdapter {
  send(mail: IMail): Promise<void>;
  getOptions<T>(): T;
}
```

- `send(mail)`: Sends the email using your service
- `getOptions<T>()`: Returns the driver's configuration options

### IMail Interface

The `mail` parameter provides these methods:

```typescript
interface IMail {
  getTo(): string | string[];
  getFrom(): string;
  getSubject(): string;
  getBody(): string | IMailViewData;
  getAttachments(): IMailAttachment[];
  getOptions<T>(): T;
}
```

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```typescript
async send(mail: Mail): Promise<void> {
  try {
    // Your sending logic
  } catch (error) {
    this.logger.error('Email sending failed', error);
    throw error; // Re-throw to let the service handle it
  }
}
```

### 2. Logging

Use the logger service for debugging and monitoring:

```typescript
this.logger.info('Email sent successfully', {
  to: mail.getTo(),
  subject: mail.getSubject(),
  driver: 'custom'
});
```

### 3. Template Support

Handle both string and template-based email bodies:

```typescript
private async generateBodyString(mail: Mail): Promise<string> {
  const body = mail.getBody();
  
  if (typeof body === 'string') {
    return body;
  }
  
  // Handle template rendering
  const { view, data = {} } = body;
  return await this.view.render({ view, data });
}
```

### 4. Type Safety

Use TypeScript interfaces for your options:

```typescript
interface MyDriverOptions {
  apiKey: string;
  region?: string;
  timeout?: number;
}

class MyDriver extends BaseMailAdapter implements MailAdapter {
  private options: MyDriverOptions;
  
  constructor(options: MyDriverOptions) {
    super();
    this.options = options;
  }
  
  getOptions<T = MyDriverOptions>(): T {
    return this.options as T;
  }
}
```

## Example: SendGrid Driver

Here's a complete example of a SendGrid driver:

```typescript
import BaseMailAdapter from '@ben-shepherd/larascript-mail/base/BaseMailAdapter';
import { MailAdapter } from '@ben-shepherd/larascript-mail';
import { Mail } from '@ben-shepherd/larascript-mail';

interface SendGridOptions {
  apiKey: string;
  fromEmail?: string;
}

class SendGridDriver extends BaseMailAdapter implements MailAdapter {
  private options: SendGridOptions;

  constructor(options: SendGridOptions) {
    super();
    this.options = options;
  }

  async send(mail: Mail): Promise<void> {
    try {
      const body = await this.generateBodyString(mail);
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.options.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: mail.getTo() }]
          }],
          from: { email: mail.getFrom() },
          subject: mail.getSubject(),
          content: [{
            type: 'text/html',
            value: body
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
      }

      this.logger.info('Email sent via SendGrid', {
        to: mail.getTo(),
        subject: mail.getSubject()
      });
    } catch (error) {
      this.logger.error('SendGrid email failed', error);
      throw error;
    }
  }

  getOptions<T = SendGridOptions>(): T {
    return this.options as T;
  }
}

export default SendGridDriver;
```

## Testing Your Driver

Create tests for your custom driver:

```typescript
import CustomMailDriver from './CustomMailDriver';

describe('CustomMailDriver', () => {
  let driver: CustomMailDriver;

  beforeEach(() => {
    driver = new CustomMailDriver({
      apiKey: 'test-key'
    });
  });

  it('should send email successfully', async () => {
    const mail = new Mail({
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test Email',
      body: 'Hello World'
    });

    await expect(driver.send(mail)).resolves.not.toThrow();
  });
});
```

This documentation provides a comprehensive guide for developers who want to extend Larascript Mail with custom drivers while following the established patterns and best practices.
